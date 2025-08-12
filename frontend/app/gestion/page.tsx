"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BookOpen, Tag, Target, Search, Save } from "lucide-react"
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
      case "thematiques":
        return thematiques.map((t) => ({
          id: t.id,
          nom: t.nom,
          matiere_nom: matiereIdToNom.get(t.matiere) || String(t.matiere),
        }))
      case "competences":
        return competences.map((c) => ({
          id: c.id,
          nom: c.titre,
          description: c.description,
          thematique_nom: thematiqueIdToNom.get(c.thematique) || String(c.thematique),
          niveau_nom: niveauIdToNom.get(c.niveau) || String(c.niveau),
        }))
      case "sous-competences":
        return sousCompetences.map((sc) => {
          const comp = competenceIdToObj.get(sc.competence)
          const themNom = comp ? (thematiqueIdToNom.get(comp.thematique) || String(comp.thematique)) : ""
          return {
            id: sc.id,
            nom: sc.titre,
            description: sc.description,
            competence_nom: comp ? comp.titre : String(sc.competence),
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
    setFormData(item)
    setShowAddDialog(true)
  }

  const handleSave = () => {
    console.log("Saving:", activeTab, formData)
    // Here you would typically save to your backend
    setShowAddDialog(false)
    setFormData({})
    setEditingItem(null)
  }

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      console.log("Deleting:", activeTab, id)
      // Here you would typically delete from your backend
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la thématique..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="niveau">Niveau</Label>
              <Select
                value={formData.niveau_id?.toString() || ""}
                onValueChange={(value) => {
                  const niveau = niveaux.find((n) => n.id.toString() === value)
                  setFormData({
                    ...formData,
                    niveau_id: Number.parseInt(value),
                    niveau_nom: niveau?.nom,
                  })
                }}
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
          </>
        )

      case "competences":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom de la compétence</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Addition simple..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la compétence..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thematique">Thématique</Label>
              <Select
                value={formData.thematique_id?.toString() || ""}
                onValueChange={(value) => {
                  const thematique = thematiques.find((t) => t.id.toString() === value)
                  setFormData({
                    ...formData,
                    thematique_id: Number.parseInt(value),
                    thematique_nom: thematique?.nom,
                  })
                }}
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
              <Label htmlFor="nom">Nom de la sous-compétence</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Addition jusqu'à 10..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la sous-compétence..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="competence">Compétence</Label>
              <Select
                value={formData.competence_id?.toString() || ""}
                onValueChange={(value) => {
                  const competence = competences.find((c) => c.id.toString() === value)
                  const themNom = competence ? (thematiqueIdToNom.get(competence.thematique) || String(competence.thematique)) : ""
                  setFormData({
                    ...formData,
                    competence_id: Number.parseInt(value),
                    competence_nom: competence?.titre,
                    thematique_nom: themNom,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une compétence" />
                </SelectTrigger>
                <SelectContent>
                  {competences.map((competence) => (
                    <SelectItem key={competence.id} value={competence.id.toString()}>
                      {competence.titre}
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
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Thématique</TableHead>
            <TableHead>Niveau</TableHead>
          </>
        )
      case "sous-competences":
        return (
          <>
            <TableHead>Nom</TableHead>
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
            <TableCell className="font-medium">{item.nom}</TableCell>
            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.thematique_nom}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.niveau_nom}</Badge>
            </TableCell>
          </>
        )
      case "sous-competences":
        return (
          <>
            <TableCell className="font-medium">{item.nom}</TableCell>
            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
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
        <TabsList className="grid w-full grid-cols-4">
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
