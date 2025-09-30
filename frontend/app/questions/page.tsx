"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { api, Question, Reponse, Competence, Thematique } from "@/lib/api"

export default function QuestionsDashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [competences, setCompetences] = useState<Competence[]>([])
  const [thematiques, setThematiques] = useState<Thematique[]>([])
  
  // Form states
  const [formData, setFormData] = useState({
    description: "",
    type: "",
    reponses: [] as Array<{ description: string; valide: boolean }>
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [questionsResponse, competencesResponse, thematiquesResponse] = await Promise.all([
        api.getQuestions(),
        api.getCompetences(),
        api.getThematiques()
      ])

      if (questionsResponse.data) setQuestions(questionsResponse.data)
      if (competencesResponse.data) setCompetences(competencesResponse.data)
      if (thematiquesResponse.data) setThematiques(thematiquesResponse.data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await api.createQuestion({
        description: formData.description,
        type: formData.type
      })

      if (response.data) {
        // Create responses for the question
        for (const reponse of formData.reponses) {
          await api.createReponse({
            description: reponse.description,
            valide: reponse.valide,
            id_question: response.data.id
          })
        }

        // Reset form
        setFormData({
          description: "",
          type: "",
          reponses: []
        })
        setShowAddDialog(false)
        // Reload data
        loadData()
      }
    } catch (error) {
      console.error("Error creating question:", error)
    } finally {
      setLoading(false)
    }
  }

  const addReponse = () => {
    setFormData({
      ...formData,
      reponses: [...formData.reponses, { description: "", valide: false }]
    })
  }

  const updateReponse = (index: number, field: string, value: any) => {
    const newReponses = [...formData.reponses]
    newReponses[index] = { ...newReponses[index], [field]: value }
    setFormData({ ...formData, reponses: newReponses })
  }

  const removeReponse = (index: number) => {
    const newReponses = formData.reponses.filter((_, i) => i !== index)
    setFormData({ ...formData, reponses: newReponses })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "qcm":
        return "QCM"
      case "vrai-faux":
        return "Vrai/Faux"
      case "question":
        return "Question ouverte"
      case "calcul":
        return "Calcul"
      case "conjugaison":
        return "Conjugaison"
      case "equation":
        return "Équation"
      case "formule":
        return "Formule"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Questions</h1>
          <p className="text-muted-foreground">Créez, modifiez et organisez vos questions pédagogiques</p>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle Question</DialogTitle>
                  <DialogDescription>Créez une nouvelle question pédagogique avec ses réponses</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Question</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Entrez votre question..." 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type de question</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qcm">QCM</SelectItem>
                        <SelectItem value="vrai-faux">Vrai/Faux</SelectItem>
                        <SelectItem value="question">Question ouverte</SelectItem>
                        <SelectItem value="calcul">Calcul</SelectItem>
                        <SelectItem value="conjugaison">Conjugaison</SelectItem>
                        <SelectItem value="equation">Équation</SelectItem>
                        <SelectItem value="formule">Formule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Réponses */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Réponses</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addReponse}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une réponse
                      </Button>
                    </div>
                    {formData.reponses.map((reponse, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          checked={reponse.valide}
                          onChange={(e) => updateReponse(index, "valide", e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Textarea
                          placeholder="Description de la réponse..."
                          value={reponse.description}
                          onChange={(e) => updateReponse(index, "description", e.target.value)}
                          rows={1}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReponse(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !formData.description || !formData.type}>
                    {loading ? "Création..." : "Créer la question"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <CardDescription>Liste de toutes vos questions pédagogiques</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Réponses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>#{question.id}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate font-medium">{question.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {question.reponses?.length || 0} réponse(s)
                        {question.reponses && question.reponses.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {question.reponses.filter(r => r.valide).length} correcte(s)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}