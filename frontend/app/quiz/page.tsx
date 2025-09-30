"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Play, Edit, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

const mockQuizzes = [
  {
    id: 1,
    titre: "Évaluation Mathématiques CP",
    description: "Quiz sur les additions et soustractions jusqu'à 20",
    questionCount: 10,
    created_at: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    titre: "Test Français CE1",
    description: "Évaluation de grammaire et conjugaison",
    questionCount: 15,
    created_at: "2024-01-14",
    status: "draft",
  },
  {
    id: 3,
    titre: "Quiz Géographie CM1",
    description: "Capitales européennes et relief",
    questionCount: 8,
    created_at: "2024-01-13",
    status: "archived",
  },
]

const mockQuestions = [
  {
    id: 1,
    texte: "Quel est le résultat de 5 + 7 ?",
    format: "QCM",
    points: 1,
  },
  {
    id: 2,
    texte: 'Conjuguez le verbe "être" au présent',
    format: "texte",
    points: 2,
  },
]

export default function QuizDashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "draft":
        return "Brouillon"
      case "archived":
        return "Archivé"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Quiz</h1>
          <p className="text-muted-foreground">Créez et organisez vos évaluations pédagogiques</p>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Quiz disponibles</h3>
              <p className="text-sm text-muted-foreground mt-1">{mockQuizzes.length} quiz créés</p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouveau Quiz</DialogTitle>
                  <DialogDescription>Créez un nouveau quiz pédagogique</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titre">Titre du Quiz</Label>
                    <Input id="titre" placeholder="Ex: Évaluation Mathématiques CP" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Description du quiz..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="niveau">Niveau</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CP">CP</SelectItem>
                          <SelectItem value="CE1">CE1</SelectItem>
                          <SelectItem value="CE2">CE2</SelectItem>
                          <SelectItem value="CM1">CM1</SelectItem>
                          <SelectItem value="CM2">CM2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="matiere">Matière</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematiques">Mathématiques</SelectItem>
                          <SelectItem value="francais">Français</SelectItem>
                          <SelectItem value="histoire-geo">Histoire-Géographie</SelectItem>
                          <SelectItem value="sciences">Sciences</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => setShowAddDialog(false)}>Créer le quiz</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{quiz.titre}</CardTitle>
                <Badge className={getStatusColor(quiz.status)}>{getStatusLabel(quiz.status)}</Badge>
              </div>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{quiz.questionCount} questions</span>
                <span>Créé le {quiz.created_at}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedQuiz(quiz)} className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Gérer
                </Button>
                <Button size="sm" className="flex-1">
                  <Play className="h-3 w-3 mr-1" />
                  Lancer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quiz Management Dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Gérer: {selectedQuiz?.titre}</DialogTitle>
                <DialogDescription>Modifiez les questions et paramètres du quiz</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedQuiz(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-4">Questions du Quiz</h4>
              <div className="space-y-3">
                {mockQuestions.map((question) => (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{question.texte}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{question.format}</Badge>
                            <span>{question.points} point(s)</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="mt-4 bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </div>

            <Separator />

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                Annuler
              </Button>
              <Button onClick={() => setSelectedQuiz(null)}>Sauvegarder les modifications</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
