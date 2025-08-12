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

// Mock hierarchical data
const mockNiveaux = [
  { id: 1, nom: "CP" },
  { id: 2, nom: "CE1" },
  { id: 3, nom: "CE2" },
  { id: 4, nom: "CM1" },
  { id: 5, nom: "CM2" },
]

const mockThematiques = [
  { id: 1, nom: "Calcul mental", niveau_id: 1, niveau_nom: "CP" },
  { id: 2, nom: "Grammaire", niveau_id: 2, niveau_nom: "CE1" },
  { id: 3, nom: "Lecture", niveau_id: 1, niveau_nom: "CP" },
  { id: 4, nom: "Géométrie", niveau_id: 3, niveau_nom: "CE2" },
]

const mockCompetences = [
  { id: 1, nom: "Addition simple", thematique_id: 1, thematique_nom: "Calcul mental", niveau_nom: "CP" },
  { id: 2, nom: "Reconnaissance des verbes", thematique_id: 2, thematique_nom: "Grammaire", niveau_nom: "CE1" },
  { id: 3, nom: "Lecture de mots simples", thematique_id: 3, thematique_nom: "Lecture", niveau_nom: "CP" },
]

const mockSousCompetences = [
  {
    id: 1,
    nom: "Addition jusqu'à 5",
    competence_id: 1,
    competence_nom: "Addition simple",
    thematique_nom: "Calcul mental",
  },
  {
    id: 2,
    nom: "Addition jusqu'à 10",
    competence_id: 1,
    competence_nom: "Addition simple",
    thematique_nom: "Calcul mental",
  },
  {
    id: 3,
    nom: "Verbes d'action",
    competence_id: 2,
    competence_nom: "Reconnaissance des verbes",
    thematique_nom: "Grammaire",
  },
]

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [formData, setFormData] = useState({
    niveau_id: "",
    thematique_id: "",
    competence_id: "",
    sous_competence_id: "",
    format: "",
    difficulte: "",
  })

  // Filtered data based on selections
  const [filteredThematiques, setFilteredThematiques] = useState(mockThematiques)
  const [filteredCompetences, setFilteredCompetences] = useState(mockCompetences)
  const [filteredSousCompetences, setFilteredSousCompetences] = useState(mockSousCompetences)

  // Update filtered data when selections change
  useEffect(() => {
    if (formData.niveau_id) {
      const filtered = mockThematiques.filter((t) => t.niveau_id.toString() === formData.niveau_id)
      setFilteredThematiques(filtered)
      setFormData((prev) => ({ ...prev, thematique_id: "", competence_id: "", sous_competence_id: "" }))
    }
  }, [formData.niveau_id])

  useEffect(() => {
    if (formData.thematique_id) {
      const filtered = mockCompetences.filter((c) => c.thematique_id.toString() === formData.thematique_id)
      setFilteredCompetences(filtered)
      setFormData((prev) => ({ ...prev, competence_id: "", sous_competence_id: "" }))
    }
  }, [formData.thematique_id])

  useEffect(() => {
    if (formData.competence_id) {
      const filtered = mockSousCompetences.filter((sc) => sc.competence_id.toString() === formData.competence_id)
      setFilteredSousCompetences(filtered)
      setFormData((prev) => ({ ...prev, sous_competence_id: "" }))
    }
  }, [formData.competence_id])

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

    // Get selected items for display
    const niveau = mockNiveaux.find((n) => n.id.toString() === formData.niveau_id)
    const thematique = filteredThematiques.find((t) => t.id.toString() === formData.thematique_id)
    const competence = filteredCompetences.find((c) => c.id.toString() === formData.competence_id)
    const sousCompetence = formData.sous_competence_id
      ? filteredSousCompetences.find((sc) => sc.id.toString() === formData.sous_competence_id)
      : null

    // Simulate API call with different question types
    setTimeout(() => {
      const questionTemplates = {
        quiz: [
          `Quelle est la réponse correcte pour cette ${competence?.nom.toLowerCase()} ?`,
          `Parmi ces options, laquelle correspond à ${competence?.nom.toLowerCase()} ?`,
          `Choisissez la bonne réponse concernant ${competence?.nom.toLowerCase()} :`,
        ],
        "true-false": [
          `Vrai ou Faux: Cette affirmation sur ${competence?.nom.toLowerCase()} est correcte.`,
          `Est-ce que cette règle de ${competence?.nom.toLowerCase()} est vraie ?`,
          `Cette proposition concernant ${competence?.nom.toLowerCase()} est-elle exacte ?`,
        ],
        question: [
          `Expliquez comment appliquer ${competence?.nom.toLowerCase()}.`,
          `Décrivez le processus de ${competence?.nom.toLowerCase()}.`,
          `Donnez un exemple de ${competence?.nom.toLowerCase()}.`,
        ],
      }

      const templates =
        questionTemplates[formData.format as keyof typeof questionTemplates] || questionTemplates.question
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

      const newQuestion: GeneratedQuestion = {
        id: Date.now(),
        texte: randomTemplate,
        format: formData.format,
        difficulte: formData.difficulte,
        niveau: niveau?.nom || "",
        thematique: thematique?.nom || "",
        competence: competence?.nom || "",
        sous_competence: sousCompetence?.nom || "",
        generated_at: new Date().toLocaleString(),
        saved: false,
      }

      setGeneratedQuestions((prev) => [newQuestion, ...prev])

      // Auto-save after 1 second
      setTimeout(() => {
        setGeneratedQuestions((prev) => prev.map((q) => (q.id === newQuestion.id ? { ...q, saved: true } : q)))
      }, 1000)

      setIsGenerating(false)
    }, 2000)
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
                  {mockNiveaux.map((niveau) => (
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
                      {competence.nom}
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
                      {sousCompetence.nom}
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
