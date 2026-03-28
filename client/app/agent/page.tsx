'use client';

import { ArrowLeft, Folder, List, Brain, Settings as SettingsIcon, Upload, Trash2, Eye, Edit3, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Toaster, toast } from '../components/ui/sonner';

const AgentPage = () => {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [isManagingInstructions, setIsManagingInstructions] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [instructionContent, setInstructionContent] = useState('');
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string[]>(['Default instruction set']);
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);
  
  // Knowledge Base State
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/knowledge/documents?namespace=default");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsImporting(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/knowledge/ingest?namespace=default", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      toast.success('Knowledge base imported', {
        description: 'Your custom knowledge base has been successfully imported.',
      });
      setFile(null);
      fetchDocuments();
    } catch (error: any) {
      toast.error('Import failed', {
        description: error.message || 'There was an error importing your knowledge base.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteDocument = async (fileName: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/knowledge/documents?namespace=default&file_name=${encodeURIComponent(fileName)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success('Document deleted', { description: `Successfully removed ${fileName}` });
        fetchDocuments();
      } else {
        throw new Error(await res.text());
      }
    } catch (e) {
      toast.error('Delete failed', { description: 'Could not remove document' });
    }
  };

  const handleSaveInstruction = async () => {
    if (!instructionContent.trim()) return;
    
    setIsSaving(true);
    
    // Simulate save delay for smooth feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (selectedInstruction) {
      // Update existing instruction
      const updatedInstructions = instructions.map(inst => 
        inst === selectedInstruction ? instructionContent : inst
      );
      setInstructions(updatedInstructions);
      setSelectedInstruction(null);
    } else {
      // Add new instruction
      setInstructions([...instructions, instructionContent]);
    }
    
    setInstructionContent('');
    setIsManagingInstructions(false);
    setIsSaving(false);
    
    toast.success('Instruction saved', {
      description: 'Your custom instruction has been saved.',
    });
  };

  const handleDeleteInstruction = (instruction: string) => {
    setInstructions(instructions.filter(inst => inst !== instruction));
    if (selectedInstruction === instruction) {
      setSelectedInstruction(null);
    }
    
    toast.error('Instruction deleted', {
      description: 'The instruction has been removed.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Enhanced focus-visible states */
        *:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        
        button:focus-visible,
        [role="button"]:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto px-6 py-8 animate-[fade-in_400ms_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 leading-normal hover:translate-x-[-2px] active:scale-[0.98] group"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[-2px]" />
            Back to Inbox
          </button>
          
          <h1 className="text-2xl font-semibold text-foreground mb-0 leading-tight animate-[slide-in-right_400ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
            Agent Management
          </h1>
        </div>

        <div className="space-y-6">
          {/* Knowledge Bases Section */}
          <section 
            className="border border-border rounded-lg p-5 animate-[slide-up_400ms_cubic-bezier(0.16,1,0.3,1)_150ms_backwards] transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
            aria-labelledby="knowledge-bases-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-muted-foreground transition-colors duration-200" aria-hidden="true" />
                <div>
                  <h2 id="knowledge-bases-heading" className="text-sm font-medium text-foreground leading-tight">
                    Knowledge Bases
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-normal">
                    Import custom knowledge bases to enhance your agent's understanding
                  </p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="transition-all duration-200 active:scale-[0.98]">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Knowledge Base
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-96 animate-[scale-in_250ms_cubic-bezier(0.16,1,0.3,1)]">
                  <DialogHeader>
                    <DialogTitle>Import Knowledge Base</DialogTitle>
                    <DialogDescription>
                      Upload a file containing your custom knowledge base to enhance the agent's responses.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                        file 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                      onClick={() => document.getElementById('file-input')?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          document.getElementById('file-input')?.click();
                        }
                      }}
                      aria-label="Upload file area"
                    >
                      <List className={`mx-auto h-8 w-8 mb-3 transition-all duration-200 ${
                        file ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-sm text-muted-foreground">
                        {file ? 'Click to change file' : 'Drag & drop files here, or click to select'}
                      </p>
                      <input 
                        type="file" 
                        id="file-input"
                        accept=".txt,.pdf,.doc,.docx,.md,.csv,.json"
                        className="hidden"
                        onChange={handleFileChange}
                        aria-label="File input"
                      />
                      {file && (
                        <p className="mt-3 text-sm text-foreground font-medium animate-[slide-up_200ms_cubic-bezier(0.16,1,0.3,1)]">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleImport} 
                      className="w-full transition-all duration-200 active:scale-[0.98]"
                      disabled={!file || isImporting}
                    >
                      {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isImporting ? 'Importing...' : 'Import Knowledge Base'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Render uploaded documents */}
            {isLoadingDocs ? (
              <div className="flex justify-center items-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading documents...</span>
              </div>
            ) : documents.length > 0 ? (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Uploaded Documents</h3>
                <div className="grid grid-cols-1 gap-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-md bg-background/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <List className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteDocument(doc.file_name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">No documents uploaded yet. Import files to build your knowledge base!</p>
            )}
          </section>

          {/* Custom Instructions Section */}
          <section 
            className="border border-border rounded-lg p-5 animate-[slide-up_400ms_cubic-bezier(0.16,1,0.3,1)_250ms_backwards] transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
            aria-labelledby="custom-instructions-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-muted-foreground transition-colors duration-200" aria-hidden="true" />
                <div>
                  <h2 id="custom-instructions-heading" className="text-sm font-medium text-foreground leading-tight">
                    Custom Instructions
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-normal">
                    Define specific behaviors and guidelines for your agent
                  </p>
                </div>
              </div>
              <Dialog open={isManagingInstructions} onOpenChange={setIsManagingInstructions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="transition-all duration-200 active:scale-[0.98]">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Manage Instructions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl animate-[scale-in_250ms_cubic-bezier(0.16,1,0.3,1)]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedInstruction ? 'Edit Instruction' : 'Add Custom Instruction'}
                    </DialogTitle>
                    <DialogDescription>
                      Define specific behaviors and guidelines for your agent to follow.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    {/* Markdown Editor Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg" role="tablist" aria-label="Editor mode">
                      <button
                        onClick={() => setViewMode('write')}
                        role="tab"
                        aria-selected={viewMode === 'write'}
                        aria-controls="editor-content"
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          viewMode === 'write'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        }`}
                      >
                        <Edit3 className="h-4 w-4" />
                        Write
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        role="tab"
                        aria-selected={viewMode === 'preview'}
                        aria-controls="editor-content"
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          viewMode === 'preview'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        }`}
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instruction">Instruction (markdown supported)</Label>
                      
                      <div className="relative" id="editor-content" role="tabpanel">
                        {viewMode === 'write' ? (
                          <Textarea 
                            key="write-mode"
                            id="instruction"
                            placeholder="Enter your custom instruction using markdown...&#10;&#10;**Example:**&#10;- Use **bold** for emphasis&#10;- Create lists with `-` or `*`&#10;- Add code with `backticks`"
                            value={instructionContent}
                            onChange={(e) => setInstructionContent(e.target.value)}
                            rows={12}
                            className="font-mono text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 animate-[fade-in_200ms_cubic-bezier(0.16,1,0.3,1)]"
                            aria-label="Instruction content"
                          />
                        ) : (
                          <div 
                            key="preview-mode"
                            className="border border-border rounded-md p-4 min-h-[288px] bg-background overflow-auto animate-[fade-in_200ms_cubic-bezier(0.16,1,0.3,1)]"
                          >
                            {instructionContent.trim() ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {instructionContent}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                No content to preview. Switch to Write mode to add your instruction.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveInstruction} 
                        className="flex-1 transition-all duration-200 active:scale-[0.98]"
                        disabled={!instructionContent.trim() || isSaving}
                      >
                        {isSaving ? 'Saving...' : `${selectedInstruction ? 'Update' : 'Save'} Instruction`}
                      </Button>
                      {selectedInstruction && (
                        <Button 
                          onClick={() => {
                            setSelectedInstruction(null);
                            setInstructionContent('');
                            setViewMode('write');
                          }}
                          variant="outline"
                          className="transition-all duration-200 active:scale-[0.98]"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Instructions List */}
            <div className="space-y-3" role="list" aria-label="Custom instructions">
              {instructions.map((instruction, index) => (
                <article 
                  key={index} 
                  role="listitem"
                  className="border border-border rounded-lg p-4 flex justify-between items-start group hover:border-primary/30 transition-all duration-300 hover:shadow-sm hover:shadow-primary/5 animate-[slide-up_400ms_cubic-bezier(0.16,1,0.3,1)_backwards]"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <div className="flex-1 pr-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-p:leading-normal prose-li:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {instruction}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => {
                        setSelectedInstruction(instruction);
                        setInstructionContent(instruction);
                        setIsManagingInstructions(true);
                        setViewMode('write');
                      }}
                      className="p-2 hover:text-primary transition-all duration-200 rounded hover:bg-muted active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Edit instruction"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteInstruction(instruction)}
                      className="p-2 hover:text-destructive transition-all duration-200 rounded hover:bg-muted active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Delete instruction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
              
              {instructions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 animate-[fade-in_400ms_cubic-bezier(0.16,1,0.3,1)_400ms_backwards]">
                  No custom instructions yet
                </p>
              )}
            </div>
          </section>
        </div>

        <Toaster />
      </div>
    </div>
  );
};

export default AgentPage;