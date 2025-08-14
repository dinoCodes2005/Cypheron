"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Plus, Search, Eye, EyeOff, Edit, Trash2, Key, FileText, CreditCard, Shield } from "lucide-react"

interface VaultEntry {
  id: string
  type: "password" | "note" | "card"
  title: string
  username?: string
  password?: string
  url?: string
  note?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  createdAt: Date
  updatedAt: Date
}

export function Vault() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [masterPassword, setMasterPassword] = useState("")
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null)

  // Demo data
  const demoEntries: VaultEntry[] = [
    {
      id: "1",
      type: "password",
      title: "GitHub",
      username: "student@university.edu",
      password: "SecurePass123!",
      url: "https://github.com",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      type: "password",
      title: "University Portal",
      username: "john.doe",
      password: "MyUniPass2024",
      url: "https://portal.university.edu",
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
    },
    {
      id: "3",
      type: "note",
      title: "WiFi Passwords",
      note: "Home WiFi: HomeNetwork2024\nCafe WiFi: CafeGuest123\nLibrary: LibraryAccess",
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 259200000),
    },
    {
      id: "4",
      type: "card",
      title: "Student Credit Card",
      cardNumber: "4532 1234 5678 9012",
      expiryDate: "12/26",
      cvv: "123",
      createdAt: new Date(Date.now() - 345600000),
      updatedAt: new Date(Date.now() - 345600000),
    },
  ]

  useEffect(() => {
    if (isUnlocked) {
      // In a real app, this would decrypt data from IndexedDB
      setEntries(demoEntries)
    }
  }, [isUnlocked])

  const unlock = () => {
    // In a real app, this would verify the master password hash
    if (masterPassword === "demo123") {
      setIsUnlocked(true)
      setMasterPassword("")
    } else {
      alert("Demo password is: demo123")
    }
  }

  const lock = () => {
    setIsUnlocked(false)
    setEntries([])
    setShowPasswords({})
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.url?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || entry.type === selectedType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return <Key className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "password":
        return "bg-primary/10 text-primary"
      case "note":
        return "bg-accent/10 text-accent"
      case "card":
        return "bg-chart-3/10 text-chart-3"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Secure Vault</h1>
            <p className="text-muted-foreground">Enter your master password to unlock your encrypted vault</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="master-password">Master Password</Label>
              <Input
                id="master-password"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter master password"
                onKeyPress={(e) => e.key === "Enter" && unlock()}
              />
            </div>
            <Button onClick={unlock} className="w-full" disabled={!masterPassword}>
              Unlock Vault
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Demo password: <code className="bg-muted px-1 rounded">demo123</code>
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Security Features</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• AES-256 encryption</li>
              <li>• Local storage only</li>
              <li>• Zero server access</li>
              <li>• Master password protection</li>
            </ul>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Secure Vault</h1>
            <p className="text-muted-foreground">{entries.length} encrypted entries stored locally</p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select defaultValue="password">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="password">Password</SelectItem>
                        <SelectItem value="note">Secure Note</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input placeholder="Entry title" />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input placeholder="Username or email" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" placeholder="Password" />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => setIsAddDialogOpen(false)}>Save Entry</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={lock}>
              <Lock className="h-4 w-4 mr-2" />
              Lock Vault
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search entries..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="password">Passwords</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="card">Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Entries Grid */}
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(entry.type)}`}>
                    {getTypeIcon(entry.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold truncate">{entry.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {entry.type}
                      </Badge>
                    </div>

                    {entry.type === "password" && (
                      <div className="space-y-2 text-sm">
                        {entry.username && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">Username:</span>
                            <span className="font-mono">{entry.username}</span>
                          </div>
                        )}
                        {entry.password && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">Password:</span>
                            <span className="font-mono">{showPasswords[entry.id] ? entry.password : "••••••••"}</span>
                            <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(entry.id)}>
                              {showPasswords[entry.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        )}
                        {entry.url && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">URL:</span>
                            <span className="font-mono text-primary truncate">{entry.url}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {entry.type === "note" && entry.note && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Note:</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm bg-muted/50 p-2 rounded">{entry.note}</p>
                      </div>
                    )}

                    {entry.type === "card" && (
                      <div className="space-y-2 text-sm">
                        {entry.cardNumber && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">Number:</span>
                            <span className="font-mono">
                              {showPasswords[entry.id]
                                ? entry.cardNumber
                                : "•••• •••• •••• " + entry.cardNumber.slice(-4)}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(entry.id)}>
                              {showPasswords[entry.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        )}
                        {entry.expiryDate && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground w-20">Expires:</span>
                            <span className="font-mono">{entry.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-3">Updated {entry.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <Card className="p-12 text-center">
            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Add your first entry to get started"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
