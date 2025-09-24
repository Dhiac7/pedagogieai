"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bot, Save, RefreshCw, Edit, CheckCircle, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, GeneratedResult, Niveau, Thematique, Competence, SousCompetence } from "@/lib/api"

interface GeneratedQuestion {
  id: number
  texte: string
  format: string
  difficulte: string
  niveau: string
  thematique: string
  competence: string
  sous_competence: string
  generated_at: string
  saved: boolean
}

// Data from API

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [thematiques, setThematiques] = useState<Thematique[]>([])
  const [competences, setCompetences] = useState<Competence[]>([])
  const [sousCompetences, setSousCompetences] = useState<SousCompetence[]>([])
  const [formData, setFormData] = useState({
    niveau_id: "",
    thematique_id: "",
    competence_id: "",
    sous_competence_id: "",
    format: "",
    difficulte: "",
  })
  const [advanced, setAdvanced] = useState({ max_new_tokens: 160, temperature: 0.7, top_p: 0.9 })

  // Filtered data based on selections
  const [filteredThematiques, setFilteredThematiques] = useState<Thematique[]>([])
  const [filteredCompetences, setFilteredCompetences] = useState<Competence[]>([])
  const [filteredSousCompetences, setFilteredSousCompetences] = useState<SousCompetence[]>([])

  // Load base data on mount
  useEffect(() => {
    const load = async () => {
      const [{ data: n }, { data: t }, { data: c }, { data: sc }] = await Promise.all([
        api.getNiveaux(),
        api.getThematiques(),
        api.getCompetences(),
        api.getSousCompetences(),
      ])
      setNiveaux(n || [])
      setThematiques(t || [])
      setCompetences(c || [])
      setSousCompetences(sc || [])
      setFilteredThematiques(t || [])
      setFilteredCompetences(c || [])
      setFilteredSousCompetences(sc || [])
    }
    load()
  }, [])

  // Update filtered data when selections change
  useEffect(() => {
    if (formData.niveau_id) {
      // Filter thematiques by matiere of niveau if applicable. If no relation, leave unchanged.
      const filtered = thematiques
      setFilteredThematiques(filtered)
      setFormData((prev) => ({ ...prev, thematique_id: "", competence_id: "", sous_competence_id: "" }))
    }
  }, [formData.niveau_id, thematiques])

  useEffect(() => {
    if (formData.thematique_id) {
      const filtered = competences.filter((c) => c.id_thematique.toString() === formData.thematique_id)
      setFilteredCompetences(filtered)
      setFormData((prev) => ({ ...prev, competence_id: "", sous_competence_id: "" }))
    }
  }, [formData.thematique_id, competences])

  useEffect(() => {
    if (formData.competence_id) {
      const filtered = sousCompetences.filter((sc) => sc.id_competence.toString() === formData.competence_id)
      setFilteredSousCompetences(filtered)
      setFormData((prev) => ({ ...prev, sous_competence_id: "" }))
    }
  }, [formData.competence_id, sousCompetences])

  const handleGenerate = async () => {
    if (
      !formData.niveau_id ||
      !formData.thematique_id ||
      !formData.competence_id ||
      !formData.format ||
      !formData.difficulte
    ) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsGenerating(true)
    const payload = {
      niveau_id: Number(formData.niveau_id),
      thematique_id: Number(formData.thematique_id),
      competence_id: Number(formData.competence_id),
      sous_competence_id: formData.sous_competence_id ? Number(formData.sous_competence_id) : undefined,
      format: formData.format as 'quiz' | 'true-false' | 'question',
      difficulte: formData.difficulte as 'easy' | 'medium' | 'hard',
    }

    const { data, error } = await api.generateQuestion(payload)
    setIsGenerating(false)
    if (error || !data) {
      alert(error || 'Erreur lors de la génération')
      return
    }

    const res: GeneratedResult = data
    const newQuestion: GeneratedQuestion = {
      id: res.question.id,
      texte: res.question.description,
      format: res.question.type,
      difficulte: res.meta.difficulte,
      niveau: res.meta.niveau,
      thematique: res.meta.thematique,
      competence: res.meta.competence,
      sous_competence: res.meta.sous_competence || "",
      generated_at: new Date().toLocaleString(),
      saved: true,
    }
    setGeneratedQuestions((prev) => [newQuestion, ...prev])
  }

  const handleGenerateLocal = async () => {
    setIsGenerating(true)
    const topic = [formData.niveau_id && `Niveau=${niveaux.find(n=>n.id.toString()===formData.niveau_id)?.nom}`,
                   formData.thematique_id && `Thématique=${thematiques.find(t=>t.id.toString()===formData.thematique_id)?.nom}`,
                   formData.competence_id && `Compétence=${competences.find(c=>c.id.toString()===formData.competence_id)?.description}`,
                  ].filter(Boolean).join(" | ")
    const prompt = `Tu es un expert en pédagogie. Génère exactement UNE question claire (une seule ligne) se terminant par un point d'interrogation. Thème: ${topic}. Ne renvoie que la question, sans préface ni options.`
    const res = await api.generateLocal({
      prompt,
      max_new_tokens: advanced.max_new_tokens,
      temperature: advanced.temperature,
      top_p: advanced.top_p,
    })
    setIsGenerating(false)
    if (res.error || !res.data) {
      alert(res.error || 'Erreur lors de la génération locale')
      return
    }
    const text = res.data.text
    const newQuestion: GeneratedQuestion = {
      id: Date.now(),
      texte: text,
      format: formData.format || 'quiz',
      difficulte: formData.difficulte || 'medium',
      niveau: niveaux.find(n=>n.id.toString()===formData.niveau_id)?.nom || '',
      thematique: thematiques.find(t=>t.id.toString()===formData.thematique_id)?.nom || '',
      competence: competences.find(c=>c.id.toString()===formData.competence_id)?.description || '',
      sous_competence: sousCompetences.find(s=>s.id.toString()===formData.sous_competence_id)?.description || "",
      generated_at: new Date().toLocaleString(),
      saved: false,
    }
    setGeneratedQuestions((prev) => [newQuestion, ...prev])
  }

  const handleManualSave = (questionId: number) => {
    setGeneratedQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, saved: true } : q)))
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case "quiz":
        return "bg-blue-100 text-blue-800"
      case "true-false":
        return "bg-green-100 text-green-800"
      case "question":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile"
      case "medium":
        return "Moyen"
      case "hard":
        return "Difficile"
      default:
        return difficulty
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "quiz":
        return "Quiz (QCM)"
      case "true-false":
        return "Vrai/Faux"
      case "question":
        return "Question ouverte"
      default:
        return format
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Génération de Questions</h1>
        <p className="text-muted-foreground">Générez des questions basées sur votre structure pédagogique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Paramètres de génération
            </CardTitle>
            <CardDescription>Sélectionnez les critères pour générer vos questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Niveau Selection */}
            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau *</Label>
              <Select
                value={formData.niveau_id}
                onValueChange={(value) => setFormData({ ...formData, niveau_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {niveaux.map((niveau) => (
                    <SelectItem key={niveau.id} value={niveau.id.toString()}>
                      {niveau.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Thématique Selection */}
            <div className="space-y-2">
              <Label htmlFor="thematique">Thématique *</Label>
              <Select
                value={formData.thematique_id}
                onValueChange={(value) => setFormData({ ...formData, thematique_id: value })}
                disabled={!formData.niveau_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une thématique" />
                </SelectTrigger>
                <SelectContent>
                  {filteredThematiques.map((thematique) => (
                    <SelectItem key={thematique.id} value={thematique.id.toString()}>
                      {thematique.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Compétence Selection */}
            <div className="space-y-2">
              <Label htmlFor="competence">Compétence *</Label>
              <Select
                value={formData.competence_id}
                onValueChange={(value) => setFormData({ ...formData, competence_id: value })}
                disabled={!formData.thematique_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une compétence" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompetences.map((competence) => (
                    <SelectItem key={competence.id} value={competence.id.toString()}>
                      {competence.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sous-compétence Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="sous-competence">Sous-compétence (optionnel)</Label>
              <Select
                value={formData.sous_competence_id}
                onValueChange={(value) => setFormData({ ...formData, sous_competence_id: value })}
                disabled={!formData.competence_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une sous-compétence" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSousCompetences.map((sousCompetence) => (
                    <SelectItem key={sousCompetence.id} value={sousCompetence.id.toString()}>
                      {sousCompetence.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Format de question *</Label>
              <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz (QCM)</SelectItem>
                  <SelectItem value="true-false">Vrai/Faux</SelectItem>
                  <SelectItem value="question">Question ouverte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <Label htmlFor="difficulte">Niveau de difficulté *</Label>
              <Select
                value={formData.difficulte}
                onValueChange={(value) => setFormData({ ...formData, difficulte: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Local LLM advanced params */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <Label>Max tokens</Label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1 text-sm"
                  min={16}
                  max={512}
                  value={advanced.max_new_tokens}
                  onChange={(e)=>setAdvanced({...advanced, max_new_tokens: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Temperature</Label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={1.5}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={advanced.temperature}
                  onChange={(e)=>setAdvanced({...advanced, temperature: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Top-p</Label>
                <input
                  type="number"
                  step="0.05"
                  min={0}
                  max={1}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={advanced.top_p}
                  onChange={(e)=>setAdvanced({...advanced, top_p: Number(e.target.value)})}
                />
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Générer la question
                </>
              )}
            </Button>

            <Button onClick={handleGenerateLocal} disabled={isGenerating} className="w-full mt-2" variant="outline">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération locale...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Générer via LLM local
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Questions générées ({generatedQuestions.length})</CardTitle>
            <CardDescription>Questions créées automatiquement et sauvegardées</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucune question générée</p>
                <p className="text-sm">Remplissez le formulaire pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((question) => (
                  <Card key={question.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={getFormatColor(question.format)}>{getFormatLabel(question.format)}</Badge>
                          <Badge className={getDifficultyColor(question.difficulte)}>
                            {getDifficultyLabel(question.difficulte)}
                          </Badge>
                          <Badge variant="outline">{question.niveau}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {question.saved ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs">Sauvegardée</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">En cours...</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">{question.generated_at}</span>
                        </div>
                      </div>

                      <p className="text-sm font-medium mb-3">{question.texte}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        <div>Thématique: {question.thematique}</div>
                        <div>Compétence: {question.competence}</div>
                        {question.sous_competence && (
                          <div className="col-span-2">Sous-compétence: {question.sous_competence}</div>
                        )}
                      </div>

                      <Separator className="my-3" />

                      <div className="flex gap-2">
                        {!question.saved && (
                          <Button size="sm" onClick={() => handleManualSave(question.id)} className="flex-1">
                            <Save className="h-3 w-3 mr-1" />
                            Sauvegarder maintenant
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Régénérer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auto-save Info */}
      {generatedQuestions.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Les questions sont automatiquement sauvegardées après génération. Vous pouvez les retrouver dans la section
            "Questions".
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
