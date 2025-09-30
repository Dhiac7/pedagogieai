import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, HelpCircle, Bot, FileText, Settings } from "lucide-react"

const dashboardOptions = [
  {
    id: "gestion",
    title: "Gestion Pédagogique",
    description: "Gérer les niveaux, thématiques, compétences et sous-compétences",
    icon: Settings,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    href: "/gestion",
  },
  {
    id: "questions",
    title: "Questions",
    description: "Consulter et organiser les questions existantes",
    icon: HelpCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    href: "/questions",
  },
  {
    id: "generate",
    title: "Génération IA",
    description: "Générer des questions avec l'intelligence artificielle",
    icon: Bot,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    href: "/generate",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Consulter et gérer les quiz existants",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    href: "/quiz",
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Tableau de Bord Principal</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gérez vos compétences pédagogiques, créez des questions et générez du contenu avec l'IA
        </p>
      </div>

      {/* Main Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardOptions.map((option) => {
          const Icon = option.icon
          return (
            <Link key={option.id} href={option.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full ${option.bgColor} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`h-8 w-8 ${option.color}`} />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{option.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compétences</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Générations IA</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+8 aujourd'hui</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
