"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BookOpen, Tag, Target, Search, Save, Book } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, type Niveau as NiveauType, type Thematique as ThematiqueType, type Competence as CompetenceType, type SousCompetence as SousCompetenceType, type Matiere as MatiereType } from "@/lib/api"

const tabs = [
  { id: "niveaux", label: "Niveaux", icon: BookOpen },
  { id: "matieres", label: "Matières", icon: Book },
  { id: "thematiques", label: "Thématiques", icon: Tag },
  { id: "competences", label: "Compétences", icon: Target },
  { id: "sous-competences", label: "Sous-Compétences", icon: Search },
]

export default function GestionDashboard() {
  const [activeTab, setActiveTab] = useState("niveaux")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  // Server data
  const [niveaux, setNiveaux] = useState<NiveauType[]>([])
  const [matieres, setMatieres] = useState<MatiereType[]>([])
  const [thematiques, setThematiques] = useState<ThematiqueType[]>([])
  const [competences, setCompetences] = useState<CompetenceType[]>([])
  const [sousCompetences, setSousCompetences] = useState<SousCompetenceType[]>([])
  const [loading, setLoading] = useState(false)

  // Load all datasets on mount
  useEffect(() => {
    let isCancelled = false
    async function loadAll() {
      setLoading(true)
      try {
        const [niv, mat, thm, cmp, sc] = await Promise.all([
          api.getNiveaux(),
          api.getMatieres(),
          api.getThematiques(),
          api.getCompetences(),
          api.getSousCompetences(),
        ])
        if (!isCancelled) {
          setNiveaux(niv.data || [])
          setMatieres(mat.data || [])
          setThematiques(thm.data || [])
          setCompetences(cmp.data || [])
          setSousCompetences(sc.data || [])
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    loadAll()
    return () => {
      isCancelled = true
    }
  }, [])

  // Helper maps for display
  const matiereIdToNom = useMemo(() => {
    const map = new Map<number, string>()
    matieres.forEach((m) => map.set(m.id, m.nom))
    return map
  }, [matieres])

  const thematiqueIdToNom = useMemo(() => {
    const map = new Map<number, string>()
    thematiques.forEach((t) => map.set(t.id, t.nom))
    return map
  }, [thematiques])

  const niveauIdToNom = useMemo(() => {
    const map = new Map<number, string>()
    niveaux.forEach((n) => map.set(n.id, n.nom))
    return map
  }, [niveaux])

  const competenceIdToObj = useMemo(() => {
    const map = new Map<number, CompetenceType>()
    competences.forEach((c) => map.set(c.id, c))
    return map
  }, [competences])

  // Data shaped for the table per tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "niveaux":
        return niveaux.map((n) => ({ id: n.id, nom: n.nom, description: "" }))
      case "matieres":
        return matieres.map((m) => ({ id: m.id, nom: m.nom, description: "" }))
      case "thematiques":
        return thematiques.map((t) => ({
          id: t.id,
          nom: t.nom,
          matiere_nom: matiereIdToNom.get(t.id_matiere) || String(t.id_matiere),
        }))
      case "competences":
        return competences.map((c) => ({
          id: c.id,
          description: c.description,
          thematique_nom: thematiqueIdToNom.get(c.id_thematique) || String(c.id_thematique),
        }))
      case "sous-competences":
        return sousCompetences.map((sc) => {
          const comp = competenceIdToObj.get(sc.id_competence)
          const themNom = comp ? (thematiqueIdToNom.get(comp.id_thematique) || String(comp.id_thematique)) : ""
          return {
            id: sc.id,
            description: sc.description,
            competence_nom: comp ? comp.description.substring(0, 30) + "..." : String(sc.id_competence),
            thematique_nom: themNom,
          }
        })
      default:
        return []
    }
  }, [activeTab, niveaux, thematiques, competences, sousCompetences, matiereIdToNom, thematiqueIdToNom, niveauIdToNom, competenceIdToObj])
  const activeTabInfo = tabs.find((t) => t.id === activeTab)

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({})
    setShowAddDialog(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    
    // Prepare form data for editing, ensuring proper field mapping
    const editFormData = { ...item }
    
    // For thematiques, ensure id_matiere is properly set
    if (activeTab === "thematiques" && item.matiere_nom) {
      const matiere = matieres.find(m => m.nom === item.matiere_nom)
      if (matiere) {
        editFormData.id_matiere = matiere.id
      }
    }
    
    // For competences, ensure id_thematique is properly set
    if (activeTab === "competences" && item.thematique_nom) {
      const thematique = thematiques.find(t => t.nom === item.thematique_nom)
      if (thematique) {
        editFormData.id_thematique = thematique.id
      }
    }
    
    // For sous-competences, ensure id_competence is properly set
    if (activeTab === "sous-competences" && item.competence_nom) {
      const competence = competences.find(c => c.description === item.competence_nom)
      if (competence) {
        editFormData.id_competence = competence.id
      }
    }
    
    setFormData(editFormData)
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    // Enhanced form validation
    const validationErrors: string[] = []
    
    if (activeTab === "thematiques") {
      if (!formData.nom || formData.nom.trim().length === 0) {
        validationErrors.push("Le nom de la thématique est obligatoire")
      }
      if (!formData.id_matiere || isNaN(Number(formData.id_matiere))) {
        validationErrors.push("Veuillez sélectionner une matière valide")
      }
    }
    
    if (activeTab === "competences") {
      if (!formData.description || formData.description.trim().length === 0) {
        validationErrors.push("La description de la compétence est obligatoire")
      }
      if (!formData.id_thematique || isNaN(Number(formData.id_thematique))) {
        validationErrors.push("Veuillez sélectionner une thématique valide")
      }
    }
    
    if (activeTab === "sous-competences") {
      if (!formData.description || formData.description.trim().length === 0) {
        validationErrors.push("La description de la sous-compétence est obligatoire")
      }
      if (!formData.id_competence || isNaN(Number(formData.id_competence))) {
        validationErrors.push("Veuillez sélectionner une compétence valide")
      }
    }
    
    if (validationErrors.length > 0) {
      alert("Erreurs de validation:\n" + validationErrors.join("\n"))
      return
    }

    setLoading(true)
    try {
      // Prepare clean data for API call
      const cleanFormData = { ...formData }
      
      // Remove display-only fields that shouldn't be sent to API
      delete cleanFormData.matiere_nom
      delete cleanFormData.thematique_nom
      delete cleanFormData.competence_nom
      
      // Ensure numeric IDs are properly converted
      if (cleanFormData.id_matiere) {
        cleanFormData.id_matiere = Number(cleanFormData.id_matiere)
      }
      if (cleanFormData.id_thematique) {
        cleanFormData.id_thematique = Number(cleanFormData.id_thematique)
      }
      if (cleanFormData.id_competence) {
        cleanFormData.id_competence = Number(cleanFormData.id_competence)
      }
      
      // Trim string fields
      if (cleanFormData.nom) {
        cleanFormData.nom = cleanFormData.nom.trim()
      }
      if (cleanFormData.description) {
        cleanFormData.description = cleanFormData.description.trim()
      }
      
      let response
      switch (activeTab) {
        case "niveaux":
          if (editingItem) {
            response = await api.updateNiveau(editingItem.id, cleanFormData)
          } else {
            response = await api.createNiveau(cleanFormData)
          }
          break
        case "matieres":
          if (editingItem) {
            response = await api.updateMatiere(editingItem.id, cleanFormData)
          } else {
            response = await api.createMatiere(cleanFormData)
          }
          break
        case "thematiques":
          if (editingItem) {
            response = await api.updateThematique(editingItem.id, cleanFormData)
          } else {
            response = await api.createThematique(cleanFormData)
          }
          break
        case "competences":
          if (editingItem) {
            response = await api.updateCompetence(editingItem.id, cleanFormData)
          } else {
            response = await api.createCompetence(cleanFormData)
          }
          break
        case "sous-competences":
          if (editingItem) {
            response = await api.updateSousCompetence(editingItem.id, cleanFormData)
          } else {
            response = await api.createSousCompetence(cleanFormData)
          }
          break
        default:
          console.log("Saving:", activeTab, cleanFormData)
          break
      }
      
      if (response?.data || response?.error === undefined) {
        // Reload data after successful save
        try {
          const [niv, mat, thm, cmp, sc] = await Promise.all([
            api.getNiveaux(),
            api.getMatieres(),
            api.getThematiques(),
            api.getCompetences(),
            api.getSousCompetences(),
          ])
          
          // Check if any reload failed
          const reloadErrors = []
          if (niv.error) reloadErrors.push("niveaux")
          if (mat.error) reloadErrors.push("matières")
          if (thm.error) reloadErrors.push("thématiques")
          if (cmp.error) reloadErrors.push("compétences")
          if (sc.error) reloadErrors.push("sous-compétences")
          
          if (reloadErrors.length > 0) {
            console.warn("Some data failed to reload:", reloadErrors)
            alert(`Sauvegarde réussie, mais erreur lors du rechargement des données: ${reloadErrors.join(", ")}`)
          }
          
          setNiveaux(niv.data || [])
          setMatieres(mat.data || [])
          setThematiques(thm.data || [])
          setCompetences(cmp.data || [])
          setSousCompetences(sc.data || [])
          
          // Show success message
          const action = editingItem ? "modifié" : "créé"
          const itemType = activeTabInfo?.label.slice(0, -1).toLowerCase() || "élément"
          alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${action} avec succès!`)
          
        } catch (reloadError) {
          console.error("Error reloading data:", reloadError)
          alert("Sauvegarde réussie, mais erreur lors du rechargement des données. Veuillez actualiser la page.")
        }
      } else {
        console.error("Save failed:", response.error)
        const errorMessage = response.error || "Erreur inconnue"
        alert(`Erreur lors de la sauvegarde:\n${errorMessage}`)
        return // Don't close dialog on error
      }
      
      setShowAddDialog(false)
      setFormData({})
      setEditingItem(null)
    } catch (error) {
      console.error("Error saving:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
      alert(`Erreur lors de la sauvegarde:\n${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      setLoading(true)
      try {
        let response
        switch (activeTab) {
          case "niveaux":
            response = await api.deleteNiveau(id)
            break
          case "matieres":
            response = await api.deleteMatiere(id)
            break
          case "thematiques":
            response = await api.deleteThematique(id)
            break
          case "competences":
            response = await api.deleteCompetence(id)
            break
          case "sous-competences":
            response = await api.deleteSousCompetence(id)
            break
          default:
            console.log("Deleting:", activeTab, id)
            break
        }
        
        if (response?.error === undefined) {
          // Reload data after successful delete
          try {
            const [niv, mat, thm, cmp, sc] = await Promise.all([
              api.getNiveaux(),
              api.getMatieres(),
              api.getThematiques(),
              api.getCompetences(),
              api.getSousCompetences(),
            ])
            
            // Check if any reload failed
            const reloadErrors = []
            if (niv.error) reloadErrors.push("niveaux")
            if (mat.error) reloadErrors.push("matières")
            if (thm.error) reloadErrors.push("thématiques")
            if (cmp.error) reloadErrors.push("compétences")
            if (sc.error) reloadErrors.push("sous-compétences")
            
            if (reloadErrors.length > 0) {
              console.warn("Some data failed to reload after delete:", reloadErrors)
              alert(`Suppression réussie, mais erreur lors du rechargement des données: ${reloadErrors.join(", ")}`)
            }
            
            setNiveaux(niv.data || [])
            setMatieres(mat.data || [])
            setThematiques(thm.data || [])
            setCompetences(cmp.data || [])
            setSousCompetences(sc.data || [])
            
            // Show success message
            alert("Élément supprimé avec succès!")
            
          } catch (reloadError) {
            console.error("Error reloading data after delete:", reloadError)
            alert("Suppression réussie, mais erreur lors du rechargement des données. Veuillez actualiser la page.")
          }
        } else {
          console.error("Delete failed:", response.error)
          const errorMessage = response.error || "Erreur inconnue"
          alert(`Erreur lors de la suppression:\n${errorMessage}`)
        }
      } catch (error) {
        console.error("Error deleting:", error)
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
        alert(`Erreur lors de la suppression:\n${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const renderFormFields = () => {
    switch (activeTab) {
      case "niveaux":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom du niveau</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: CP, CE1..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du niveau..."
                rows={3}
              />
            </div>
          </>
        )

      case "matieres":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom de la matière</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Mathématiques, Français..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la matière..."
                rows={3}
              />
            </div>
          </>
        )

      case "thematiques":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom de la thématique</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Calcul mental, Grammaire..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id_matiere">Matière *</Label>
              <Select
                value={formData.id_matiere?.toString() || ""}
                onValueChange={(value) => {
                  const matiere = matieres.find((m) => m.id.toString() === value)
                  setFormData({
                    ...formData,
                    id_matiere: Number.parseInt(value),
                    matiere_nom: matiere?.nom,
                  })
                }}
                required
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
          </>
        )

      case "competences":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="description">Description de la compétence *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Addition simple, Calcul mental jusqu'à 20..."
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id_thematique">Thématique *</Label>
              <Select
                value={formData.id_thematique?.toString() || ""}
                onValueChange={(value) => {
                  const thematique = thematiques.find((t) => t.id.toString() === value)
                  setFormData({
                    ...formData,
                    id_thematique: Number.parseInt(value),
                    thematique_nom: thematique?.nom,
                  })
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une thématique" />
                </SelectTrigger>
                <SelectContent>
                  {thematiques.map((thematique) => (
                    <SelectItem key={thematique.id} value={thematique.id.toString()}>
                      {thematique.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "sous-competences":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="description">Description de la sous-compétence *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Addition jusqu'à 10, Multiplication par 2..."
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id_competence">Compétence *</Label>
              <Select
                value={formData.id_competence?.toString() || ""}
                onValueChange={(value) => {
                  const competence = competences.find((c) => c.id.toString() === value)
                  const themNom = competence ? (thematiqueIdToNom.get(competence.id_thematique) || String(competence.id_thematique)) : ""
                  setFormData({
                    ...formData,
                    id_competence: Number.parseInt(value),
                    competence_nom: competence?.description,
                    thematique_nom: themNom,
                  })
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une compétence" />
                </SelectTrigger>
                <SelectContent>
                  {competences.map((competence) => (
                    <SelectItem key={competence.id} value={competence.id.toString()}>
                      {competence.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "niveaux":
        return (
          <>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
          </>
        )
      case "matieres":
        return (
          <>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
          </>
        )
      case "thematiques":
        return (
          <>
            <TableHead>Nom</TableHead>
            <TableHead>Matière</TableHead>
          </>
        )
      case "competences":
        return (
          <>
            <TableHead>Description</TableHead>
            <TableHead>Thématique</TableHead>
          </>
        )
      case "sous-competences":
        return (
          <>
            <TableHead>Description</TableHead>
            <TableHead>Compétence</TableHead>
            <TableHead>Thématique</TableHead>
          </>
        )
      default:
        return null
    }
  }

  const renderTableCells = (item: any) => {
    switch (activeTab) {
      case "niveaux":
        return (
          <>
            <TableCell className="font-medium">{item.nom}</TableCell>
            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
          </>
        )
      case "matieres":
        return (
          <>
            <TableCell className="font-medium">{item.nom}</TableCell>
            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
          </>
        )
      case "thematiques":
        return (
          <>
            <TableCell className="font-medium">{item.nom}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.matiere_nom}</Badge>
            </TableCell>
          </>
        )
      case "competences":
        return (
          <>
            <TableCell className="font-medium max-w-xs truncate">{item.description}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.thematique_nom}</Badge>
            </TableCell>
          </>
        )
      case "sous-competences":
        return (
          <>
            <TableCell className="font-medium max-w-xs truncate">{item.description}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.competence_nom}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.thematique_nom}</Badge>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion Pédagogique</h1>
          <p className="text-muted-foreground">Organisez votre structure pédagogique hiérarchique</p>
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
                    <CardDescription>
                      Gérez vos {tab.label.toLowerCase()} - {currentData.length} élément(s)
                    </CardDescription>
                  </div>
                  <Button onClick={handleAdd} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      {renderTableHeaders()}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>#{item.id}</TableCell>
                        {renderTableCells(item)}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier" : "Ajouter"} {activeTabInfo?.label.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifiez" : "Créez"} un nouveau {activeTabInfo?.label.slice(0, -1).toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">{renderFormFields()}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingItem ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
