"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BookOpen, Book, Tag, Target, Search } from "lucide-react"
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

const tabs = [
  { id: "niveaux", label: "Niveaux", icon: BookOpen },
  { id: "matieres", label: "Matières", icon: Book },
  { id: "thematiques", label: "Thématiques", icon: Tag },
  { id: "competences", label: "Compétences", icon: Target },
  { id: "sous-competences", label: "Sous-Compétences", icon: Search },
]

const mockData = {
  niveaux: [
    { id: 1, nom: "CP" },
    { id: 2, nom: "CE1" },
    { id: 3, nom: "CE2" },
    { id: 4, nom: "CM1" },
    { id: 5, nom: "CM2" },
  ],
  matieres: [
    { id: 1, nom: "Mathématiques" },
    { id: 2, nom: "Français" },
    { id: 3, nom: "Histoire-Géographie" },
    { id: 4, nom: "Sciences" },
  ],
  thematiques: [
    { id: 1, nom: "Calcul mental", matiere: "Mathématiques" },
    { id: 2, nom: "Grammaire", matiere: "Français" },
    { id: 3, nom: "Lecture", matiere: "Français" },
  ],
  competences: [
    {
      id: 1,
      titre: "Additionner des nombres",
      description: "Savoir additionner des nombres entiers",
      thematique: "Calcul mental",
      niveau: "CP",
    },
    {
      id: 2,
      titre: "Reconnaître les verbes",
      description: "Identifier les verbes dans une phrase",
      thematique: "Grammaire",
      niveau: "CE1",
    },
  ],
  "sous-competences": [
    {
      id: 1,
      titre: "Additionner jusqu'à 10",
      description: "Additionner des nombres de 1 à 10",
      competence: "Additionner des nombres",
    },
    {
      id: 2,
      titre: "Additionner jusqu'à 20",
      description: "Additionner des nombres de 1 à 20",
      competence: "Additionner des nombres",
    },
  ],
}

export default function CompetencesDashboard() {
  const [activeTab, setActiveTab] = useState("niveaux")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const currentData = mockData[activeTab as keyof typeof mockData] || []
  const activeTabInfo = tabs.find((t) => t.id === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Compétences</h1>
          <p className="text-muted-foreground">Organisez vos niveaux, matières et compétences pédagogiques</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </CardTitle>
                    <CardDescription>Gérez vos {tab.label.toLowerCase()}</CardDescription>
                  </div>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un(e) {tab.label.slice(0, -1)}</DialogTitle>
                        <DialogDescription>Créez un nouveau {tab.label.slice(0, -1).toLowerCase()}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nom">Nom</Label>
                          <Input id="nom" placeholder="Entrez le nom..." />
                        </div>
                        {(activeTab === "competences" || activeTab === "sous-competences") && (
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" placeholder="Entrez la description..." />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={() => setShowAddDialog(false)}>Créer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom/Titre</TableHead>
                      {activeTab === "competences" && (
                        <>
                          <TableHead>Description</TableHead>
                          <TableHead>Thématique</TableHead>
                          <TableHead>Niveau</TableHead>
                        </>
                      )}
                      {activeTab === "thematiques" && <TableHead>Matière</TableHead>}
                      {activeTab === "sous-competences" && (
                        <>
                          <TableHead>Description</TableHead>
                          <TableHead>Compétence</TableHead>
                        </>
                      )}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell className="font-medium">{item.nom || item.titre}</TableCell>
                        {activeTab === "competences" && (
                          <>
                            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.thematique}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.niveau}</Badge>
                            </TableCell>
                          </>
                        )}
                        {activeTab === "thematiques" && (
                          <TableCell>
                            <Badge variant="secondary">{item.matiere}</Badge>
                          </TableCell>
                        )}
                        {activeTab === "sous-competences" && (
                          <>
                            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.competence}</Badge>
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
