import { useState } from 'react';
import { Mail, MailOpen, Reply, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockMessages, Message } from '@/data/mockData';
import { formatDate } from '@/lib/dateUtils';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || message.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, read: true } : m
      ));
    }
    setShowReply(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleSendReply = () => {
    if (replyText.trim() && selectedMessage) {
      console.log('Enviando respuesta:', replyText);
      setReplyText('');
      setShowReply(false);
      alert('Respuesta enviada correctamente');
    }
  };

  const getMessageIcon = (type: string, read: boolean) => {
    if (read) {
      return <MailOpen className="w-4 h-4 text-gray-400" />;
    }
    return <Mail className="w-4 h-4 text-blue-600" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'reminder': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'patient': return 'Paciente';
      case 'system': return 'Sistema';
      case 'reminder': return 'Recordatorio';
      default: return 'Otro';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} mensajes sin leer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de mensajes */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bandeja de entrada</CardTitle>
                <Badge variant="secondary">{filteredMessages.length}</Badge>
              </div>
              
              {/* Filtros */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar mensajes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="patient">Pacientes</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="reminder">Recordatorios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                    } ${!message.read ? 'bg-blue-25' : ''}`}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getMessageIcon(message.type, message.read)}
                        <span className={`text-sm ${!message.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                          {message.from}
                        </span>
                      </div>
                      <Badge className={`text-xs ${getTypeColor(message.type)}`}>
                        {getTypeLabel(message.type)}
                      </Badge>
                    </div>
                    <h4 className={`text-sm ${!message.read ? 'font-semibold' : ''} text-gray-900 mb-1 truncate`}>
                      {message.subject}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mb-2">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(message.date)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle del mensaje */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        De: {selectedMessage.from}
                      </span>
                      <Badge className={getTypeColor(selectedMessage.type)}>
                        {getTypeLabel(selectedMessage.type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(selectedMessage.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {selectedMessage.type === 'patient' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReply(!showReply)}
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>

                {showReply && selectedMessage.type === 'patient' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Responder a {selectedMessage.from}</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Escriba su respuesta..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleSendReply} className="medical-primary">
                          Enviar Respuesta
                        </Button>
                        <Button variant="outline" onClick={() => setShowReply(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un mensaje
                </h3>
                <p className="text-gray-600">
                  Elige un mensaje de la lista para ver su contenido completo
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}