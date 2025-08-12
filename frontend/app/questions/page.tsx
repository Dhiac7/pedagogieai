"use client"

import { useState } from "react"
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

const mockQuestions = [
  {
    id: 1,
    texte: "Quel est le résultat de 5 + 7 ?",
    format: "quiz",
    difficulte: "easy",
    niveau: "CP",
    thematique: "Calcul mental",
    competence: "Addition simple",
    sous_competence: "Addition jusqu'à 10",
    statut: "validated",
    created_at: "2024-01-15",
    source: "generated",
  },
  {
    id: 2,
    texte: 'Vrai ou Faux: Le verbe "être" se conjugue "je suis" à la première personne du singulier.',
    format: "true-false",
    difficulte: "medium",
    niveau: "CE1",
    thematique: "Grammaire",
    competence: "Reconnaissance des verbes",
    sous_competence: "Verbes d'action",
    statut: "validated",
    created_at: "2024-01-14",
    source: "generated",
  },
  {
    id: 3,
    texte: "Expliquez comment lire un mot de 4 lettres.",
    format: "question",
    difficulte: "easy",
    niveau: "CP",
    thematique: "Lecture",
    competence: "Lecture de mots simples",
    sous_competence: "",
    statut: "draft",
    created_at: "2024-01-13",
    source: "manual",
  },
]

const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "generated", label: "Générée" },
  { value: "validated", label: "Validée" },
  { value: "archived", label: "Archivée" },
]

export default function QuestionsDashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredQuestions =
    filterStatus === "all" ? mockQuestions : mockQuestions.filter((q) => q.statut === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "bg-green-100 text-green-800"
      case "generated":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Facile":
        return "bg-green-100 text-green-800"
      case "Moyen":
        return "bg-yellow-100 text-yellow-800"
      case "Difficile":
        return "bg-red-100 text-red-800"
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

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status)
    return option ? option.label : status
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "quiz":
        return "Quiz (QCM)"
      case "true-false":
        return "Vrai/Faux"
      case "question":
        return "Question ouverte"
      case "QCM":
        return "Quiz (QCM)"
      case "texte":
        return "Question ouverte"
      default:
        return format
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
      case "Facile":
        return "Facile"
      case "Moyen":
        return "Moyen"
      case "Difficile":
        return "Difficile"
      default:
        return difficulty
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

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Label>Statut:</Label>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouvelle Question</DialogTitle>
                  <DialogDescription>Créez une nouvelle question pédagogique</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="question">Question</Label>
                    <Textarea id="question" placeholder="Entrez votre question..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="format">Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QCM">QCM</SelectItem>
                          <SelectItem value="vrai-faux">Vrai/Faux</SelectItem>
                          <SelectItem value="texte">Texte libre</SelectItem>
                          <SelectItem value="numerique">Numérique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulte">Difficulté</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facile">Facile</SelectItem>
                          <SelectItem value="moyen">Moyen</SelectItem>
                          <SelectItem value="difficile">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="competence">Compétence</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="addition">Additionner des nombres</SelectItem>
                          <SelectItem value="conjugaison">Conjugaison</SelectItem>
                          <SelectItem value="geographie">Géographie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sous-competence">Sous-compétence</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="addition-20">Additionner jusqu'à 20</SelectItem>
                          <SelectItem value="present">Présent de l'indicatif</SelectItem>
                          <SelectItem value="capitales">Capitales européennes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => setShowAddDialog(false)}>Créer la question</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>Liste de toutes vos questions pédagogiques</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Thématique</TableHead>
                <TableHead>Compétence</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">{question.texte}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getFormatLabel(question.format)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficulte)}>
                      {getDifficultyLabel(question.difficulte)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.niveau}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{question.thematique}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{question.competence}</div>
                      {question.sous_competence && (
                        <div className="text-muted-foreground text-xs">{question.sous_competence}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.source === "generated" ? "default" : "secondary"}>
                      {question.source === "generated" ? "IA" : "Manuel"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(question.statut)}>{getStatusLabel(question.statut)}</Badge>
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
        </CardContent>
      </Card>
    </div>
  )
}
