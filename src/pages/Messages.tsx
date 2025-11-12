import { useState, useEffect } from 'react';
import { Mail, MailOpen, Reply, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebase/config';
import { sendReminderEmail } from "@/utils/sendReminder";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function RecordatorioPaciente({ patientEmail, patientName }) {
  const handleSendReminder = async () => {
    const success = await sendReminderEmail(
      patientEmail,
      patientName,
      "Hola, este es un recordatorio de su próxima cita médica."
    );
    if (success) alert("Recordatorio enviado correctamente ✅");
    else alert("Error al enviar el recordatorio ❌");
  };

  return (
    <Button
      onClick={handleSendReminder}
      className="bg-cyan-600 hover:bg-cyan-700 text-white"
    >
      Enviar recordatorio
    </Button>
  );
}
  // Cargar mensajes en tiempo real cuando el doctor inicia sesión
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const doctorsQuery = query(
          collection(db, "doctors"),
          where("email", "==", user.email)
        );

          const doctorsSnapshot = await getDocs(doctorsQuery);

          if (!doctorsSnapshot.empty) {
            const doctorDoc = doctorsSnapshot.docs[0];
            const doctorId = doctorDoc.id;

            console.log("Doctor encontrado:", doctorId);

            const messagesQuery = query(
              collection(db, "messages"),
              where("toDoctorId", "==", doctorId)
            );

            const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
              if (snapshot.empty) {
                console.log("No hay mensajes para este doctor:", doctorId);
                setMessages([]);
              } else {
                const messagesList = snapshot.docs.map((doc) => {
                  const data = doc.data();
                  let messageDate;
                  if (typeof data.date === "string") {
                    messageDate = new Date(data.date);
                  }
                  else if (data.date?.toDate) {
                    messageDate = data.date.toDate();
                  }
                  else {
                    messageDate = new Date();
                  }

                  return {
                    id: doc.id,
                    ...data,
                    date: messageDate,
                  };
                });

                messagesList.sort((a, b) => b.date - a.date);
                setMessages(messagesList);
              }

              setLoading(false);
            });

            return () => unsubscribeMessages();
          } else {
            console.warn("No se encontró un doctor asociado a este usuario:", user.uid);
            setMessages([]);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error obteniendo el doctor:", error);
          setLoading(false);
        }
      } else {
        setMessages([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || message.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setShowReply(false);

    // Marcar como leído en Firestore
    if (!message.read) {
      try {
        const messageRef = doc(db, 'messages', message.id);
        await updateDoc(messageRef, { read: true });
      } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      alert('Error al eliminar el mensaje');
    }
  };

  const handleSendReply = async () => {
    if (replyText.trim() && selectedMessage && currentUser) {
      try {
        await addDoc(collection(db, 'messages'), {
          from: currentUser.email || 'Doctor',
          subject: `Re: ${selectedMessage.subject}`,
          content: replyText,
          type: 'system',
          read: false,
          date: new Date().toISOString(),
          toDoctorId: selectedMessage.toDoctorId,
          replyTo: selectedMessage.id,
          patientEmail: selectedMessage.from,
        });

        setReplyText('');
        setShowReply(false);
        alert('Respuesta enviada correctamente');
      } catch (error) {
        console.error('Error al enviar respuesta:', error);
        alert('Error al enviar la respuesta');
      }
    }
  };

  const getMessageIcon = (type, read) =>
    read ? (
      <MailOpen className="w-4 h-4 text-gray-400" />
    ) : (
      <Mail className="w-4 h-4 text-blue-600" />
    );

  const getTypeColor = (type) => {
    switch (type) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'reminder': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'patient': return 'Paciente';
      case 'system': return 'Sistema';
      case 'reminder': return 'Recordatorio';
      default: return 'Otro';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-600">Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-600 mt-1">{unreadCount} mensajes sin leer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              {selectedMessage && selectedMessage.type === 'patient' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    sendReminderEmail(
                      selectedMessage.from,
                      selectedMessage.from.split('@')[0],
                      `Hola, este es un recordatorio de su próxima cita médica con el Dr. ${currentUser?.displayName || 'su médico de cabecera'}.`
                    ).then(success => {
                      if (success) alert("Recordatorio enviado correctamente ✅");
                      else alert("Error al enviar el recordatorio ❌");
                    })
                  }
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar recordatorio
                </Button>
              )}


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
                {filteredMessages.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No hay mensajes</div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
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
                      <p className="text-xs text-gray-500 truncate mb-2">{message.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{formatDate(message.date)}</span>
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">De: {selectedMessage.from}</span>
                      <Badge className={getTypeColor(selectedMessage.type)}>
                        {getTypeLabel(selectedMessage.type)}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDate(selectedMessage.date)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {selectedMessage.type === 'patient' && (
                      <Button variant="outline" size="sm" onClick={() => setShowReply(!showReply)}>
                        <Reply className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDeleteMessage(selectedMessage.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {showReply && selectedMessage.type === 'patient' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Responder a {selectedMessage.from}
                    </h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Escriba su respuesta..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSendReply}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
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
