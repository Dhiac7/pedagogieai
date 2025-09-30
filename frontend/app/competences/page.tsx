"use client"

import { useState, useEffect } from "react"
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
import { api, Niveau, Matiere, Thematique, Competence, SousCompetence } from "@/lib/api"

const tabs = [
  { id: "niveaux", label: "Niveaux", icon: BookOpen },
  { id: "matieres", label: "Matières", icon: Book },
  { id: "thematiques", label: "Thématiques", icon: Tag },
  { id: "competences", label: "Compétences", icon: Target },
  { id: "sous-competences", label: "Sous-Compétences", icon: Search },
]

export default function CompetencesDashboard() {
  const [activeTab, setActiveTab] = useState("niveaux")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [matieres, setMatieres] = useState<Matiere[]>([])
  const [thematiques, setThematiques] = useState<Thematique[]>([])
  const [competences, setCompetences] = useState<Competence[]>([])
  const [sousCompetences, setSousCompetences] = useState<SousCompetence[]>([])

  // Form states
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    id_matiere: "",
    id_thematique: "",
    id_competence: "",
  })

  // Load data based on active tab
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case "niveaux":
          const niveauxResponse = await api.getNiveaux()
          if (niveauxResponse.data) setNiveaux(niveauxResponse.data)
          break
        case "matieres":
          const matieresResponse = await api.getMatieres()
          if (matieresResponse.data) setMatieres(matieresResponse.data)
          break
        case "thematiques":
          const thematiquesResponse = await api.getThematiques()
          if (thematiquesResponse.data) setThematiques(thematiquesResponse.data)
          break
        case "competences":
          const competencesResponse = await api.getCompetences()
          if (competencesResponse.data) setCompetences(competencesResponse.data)
          break
        case "sous-competences":
          const sousCompetencesResponse = await api.getSousCompetences()
          if (sousCompetencesResponse.data) setSousCompetences(sousCompetencesResponse.data)
          break
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case "niveaux": return niveaux
      case "matieres": return matieres
      case "thematiques": return thematiques
      case "competences": return competences
      case "sous-competences": return sousCompetences
      default: return []
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Here you would implement the actual API calls to create new items
      console.log("Creating new item:", formData)
      // Reset form
      setFormData({
        nom: "",
        description: "",
        id_matiere: "",
        id_thematique: "",
        id_competence: "",
      })
      setShowAddDialog(false)
      // Reload data
      loadData()
    } catch (error) {
      console.error("Error creating item:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentData = getCurrentData()
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
                          <Input 
                            id="nom" 
                            placeholder="Entrez le nom..." 
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          />
                        </div>
                        {(activeTab === "competences" || activeTab === "sous-competences") && (
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input 
                              id="description" 
                              placeholder="Entrez la description..." 
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                          </div>
                        )}
                        {activeTab === "thematiques" && (
                          <div className="grid gap-2">
                            <Label htmlFor="id_matiere">Matière</Label>
                            <select 
                              id="id_matiere"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={formData.id_matiere}
                              onChange={(e) => setFormData({...formData, id_matiere: e.target.value})}
                            >
                              <option value="">Sélectionnez une matière</option>
                              {matieres.map((matiere) => (
                                <option key={matiere.id} value={matiere.id}>
                                  {matiere.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {activeTab === "competences" && (
                          <div className="grid gap-2">
                            <Label htmlFor="id_thematique">Thématique</Label>
                            <select 
                              id="id_thematique"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={formData.id_thematique}
                              onChange={(e) => setFormData({...formData, id_thematique: e.target.value})}
                            >
                              <option value="">Sélectionnez une thématique</option>
                              {thematiques.map((thematique) => (
                                <option key={thematique.id} value={thematique.id}>
                                  {thematique.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {activeTab === "sous-competences" && (
                          <div className="grid gap-2">
                            <Label htmlFor="id_competence">Compétence</Label>
                            <select 
                              id="id_competence"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={formData.id_competence}
                              onChange={(e) => setFormData({...formData, id_competence: e.target.value})}
                            >
                              <option value="">Sélectionnez une compétence</option>
                              {competences.map((competence) => (
                                <option key={competence.id} value={competence.id}>
                                  {competence.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                          {loading ? "Création..." : "Créer"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
                        <TableHead>Nom/Titre</TableHead>
                        {activeTab === "competences" && (
                          <>
                            <TableHead>Description</TableHead>
                            <TableHead>Thématique</TableHead>
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
                          <TableCell className="font-medium">
                            {item.nom || item.description?.substring(0, 50) + "..."}
                          </TableCell>
                          {activeTab === "competences" && (
                            <>
                              <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {thematiques.find(t => t.id === item.id_thematique)?.nom || "N/A"}
                                </Badge>
                              </TableCell>
                            </>
                          )}
                          {activeTab === "thematiques" && (
                            <TableCell>
                              <Badge variant="secondary">
                                {matieres.find(m => m.id === item.id_matiere)?.nom || "N/A"}
                              </Badge>
                            </TableCell>
                          )}
                          {activeTab === "sous-competences" && (
                            <>
                              <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {competences.find(c => c.id === item.id_competence)?.description?.substring(0, 30) + "..." || "N/A"}
                                </Badge>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}