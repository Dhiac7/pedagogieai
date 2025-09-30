"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bot, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, Niveau, Matiere, Thematique, Competence, SousCompetence } from "@/lib/api"

interface QuestionRequest {
  school_level: string
  module: string
  thematic: string
  competence: string
  sous_competence: string
  num_questions: number
  question_type: string
}

interface QuestionResponse {
  questions: string
  status?: string
  error?: string
}

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<string>("")
  
  // Database data
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [matieres, setMatieres] = useState<Matiere[]>([])
  const [thematiques, setThematiques] = useState<Thematique[]>([])
  const [competences, setCompetences] = useState<Competence[]>([])
  const [sousCompetences, setSousCompetences] = useState<SousCompetence[]>([])
  
  // Filtered data based on selections
  const [filteredThematiques, setFilteredThematiques] = useState<Thematique[]>([])
  const [filteredCompetences, setFilteredCompetences] = useState<Competence[]>([])
  const [filteredSousCompetences, setFilteredSousCompetences] = useState<SousCompetence[]>([])
  
  const [formData, setFormData] = useState({
    niveau_id: "",
    matiere_id: "",
    thematique_id: "",
    competence_id: "",
    sous_competence_id: "",
    num_questions: 3,
    question_type: "quiz"
  })

  // Load base data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [niveauxRes, matieresRes, thematiquesRes, competencesRes, sousCompetencesRes] = await Promise.all([
          api.getNiveaux(),
          api.getMatieres(),
          api.getThematiques(),
          api.getCompetences(),
          api.getSousCompetences(),
        ])
        
        setNiveaux(niveauxRes.data || [])
        setMatieres(matieresRes.data || [])
        setThematiques(thematiquesRes.data || [])
        setCompetences(competencesRes.data || [])
        setSousCompetences(sousCompetencesRes.data || [])
        setFilteredThematiques(thematiquesRes.data || [])
        setFilteredCompetences(competencesRes.data || [])
        setFilteredSousCompetences(sousCompetencesRes.data || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Update filtered data when selections change
  useEffect(() => {
    if (formData.matiere_id) {
      const filtered = thematiques.filter((t) => t.id_matiere.toString() === formData.matiere_id)
      setFilteredThematiques(filtered)
      setFormData((prev) => ({ ...prev, thematique_id: "", competence_id: "", sous_competence_id: "" }))
    }
  }, [formData.matiere_id, thematiques])

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
      !formData.matiere_id ||
      !formData.thematique_id ||
      !formData.competence_id
    ) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsGenerating(true)
    
    try {
      // Get the selected items for the API call
      const selectedNiveau = niveaux.find(n => n.id.toString() === formData.niveau_id)
      const selectedMatiere = matieres.find(m => m.id.toString() === formData.matiere_id)
      const selectedThematique = thematiques.find(t => t.id.toString() === formData.thematique_id)
      const selectedCompetence = competences.find(c => c.id.toString() === formData.competence_id)
      const selectedSousCompetence = sousCompetences.find(sc => sc.id.toString() === formData.sous_competence_id)

      const requestData = {
        school_level: selectedNiveau?.nom || "",
        module: selectedMatiere?.nom || "",
        thematic: selectedThematique?.nom || "",
        competence: selectedCompetence?.description || "",
        sous_competence: selectedSousCompetence?.description || "",
        num_questions: formData.num_questions,
        question_type: formData.question_type
      }

      const response = await fetch('http://localhost:8001/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
      }

      const data: QuestionResponse = await response.json()
      
      if (data.status === 'error') {
        throw new Error(data.error || 'Erreur lors de la génération')
      }
      
      setGeneratedQuestions(data.questions)
    } catch (error) {
      console.error('Error generating questions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      alert(`Erreur lors de la génération des questions: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setFormData({
      niveau_id: "",
      matiere_id: "",
      thematique_id: "",
      competence_id: "",
      sous_competence_id: "",
      num_questions: 3,
      question_type: "quiz"
    })
    setGeneratedQuestions("")
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "bg-blue-100 text-blue-800"
      case "essay":
        return "bg-green-100 text-green-800"
      case "multiple_choice":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "quiz":
        return "Quiz"
      case "essay":
        return "Dissertation"
      case "multiple_choice":
        return "Choix multiples"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Génération de Questions</h1>
        <p className="text-muted-foreground">Générez des questions basées sur vos critères pédagogiques</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Paramètres de génération
            </CardTitle>
            <CardDescription>Remplissez les critères pour générer vos questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Niveau Selection */}
            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau scolaire *</Label>
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

            {/* Matiere Selection */}
            <div className="space-y-2">
              <Label htmlFor="matiere">Matière *</Label>
              <Select
                value={formData.matiere_id}
                onValueChange={(value) => setFormData({ ...formData, matiere_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id.toString()}>
                      {matiere.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Thematique Selection */}
            <div className="space-y-2">
              <Label htmlFor="thematique">Thématique *</Label>
              <Select
                value={formData.thematique_id}
                onValueChange={(value) => setFormData({ ...formData, thematique_id: value })}
                disabled={!formData.matiere_id}
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

            {/* Competence Selection */}
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

            {/* Sous-competence Selection (Optional) */}
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

            {/* Number of Questions */}
            <div className="space-y-2">
              <Label htmlFor="num_questions">Nombre de questions</Label>
              <Input
                id="num_questions"
                type="number"
                min="1"
                max="10"
                value={formData.num_questions}
                onChange={(e) => setFormData({ ...formData, num_questions: parseInt(e.target.value) || 3 })}
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label htmlFor="question_type">Type de question</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value) => setFormData({ ...formData, question_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="essay">Dissertation</SelectItem>
                  <SelectItem value="multiple_choice">Choix multiples</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Générer les questions
                  </>
                )}
              </Button>
              
              <Button onClick={handleReset} variant="outline" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Questions générées
            </CardTitle>
            <CardDescription>Résultat de la génération</CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedQuestions ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucune question générée</p>
                <p className="text-sm">Remplissez le formulaire et cliquez sur "Générer les questions"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getQuestionTypeColor(formData.question_type)}>
                    {getQuestionTypeLabel(formData.question_type)}
                  </Badge>
                  <Badge variant="outline">{formData.num_questions} question(s)</Badge>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedQuestions}
                  </pre>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p><strong>Niveau:</strong> {niveaux.find(n => n.id.toString() === formData.niveau_id)?.nom || 'Non sélectionné'}</p>
                  <p><strong>Matière:</strong> {matieres.find(m => m.id.toString() === formData.matiere_id)?.nom || 'Non sélectionnée'}</p>
                  <p><strong>Thématique:</strong> {thematiques.find(t => t.id.toString() === formData.thematique_id)?.nom || 'Non sélectionnée'}</p>
                  <p><strong>Compétence:</strong> {competences.find(c => c.id.toString() === formData.competence_id)?.description || 'Non sélectionnée'}</p>
                  <p><strong>Sous-compétence:</strong> {sousCompetences.find(sc => sc.id.toString() === formData.sous_competence_id)?.description || 'Non sélectionnée'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example Usage */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Instructions:</strong> Sélectionnez d'abord un niveau scolaire, puis une matière. 
          Les thématiques se filtreront automatiquement selon la matière choisie. 
          Ensuite, sélectionnez une compétence (les sous-compétences sont optionnelles).
        </AlertDescription>
      </Alert>
    </div>
  )
}
