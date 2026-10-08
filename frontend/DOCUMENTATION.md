# L.N.X Advanced Agent - System Documentation

## Overview

L.N.X (Advanced Agent) is a sophisticated AI interface frontend application built with modern web technologies. The system provides a sci-fi themed interface for interacting with an AI assistant, featuring real-time status indicators, voice activity visualization, system logs, AI message history, and connection status monitoring.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom sci-fi theme
- **UI Components**: ShadCN UI (Radix UI primitives)
- **Animations**: Framer Motion
- **State Management**: React Query for server state, local state with useState
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Project Structure

```
src/
├── components/
│   ├── ui/                    # ShadCN UI components
│   └── ai-interface/          # AI-specific components
│       ├── AICore.tsx         # Main AI visual core
│       ├── AIMessages.tsx     # AI conversation display
│       ├── BackgroundGrid.tsx # Animated background
│       ├── ConnectionStatus.tsx # Backend connection status
│       ├── ConnectorLines.tsx # Visual connectors
│       ├── FloatingPanel.tsx  # Panel containers
│       ├── StatusIndicator.tsx # AI status controls
│       ├── SystemLogs.tsx     # System activity logs
│       └── WaveformVisualizer.tsx # Voice activity visualization
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities and configurations
├── pages/                     # Route components
│   ├── Index.tsx             # Main dashboard
│   └── NotFound.tsx          # 404 page
└── main.tsx                   # Application entry point
```

## Core Components

### AICore Component
- **Purpose**: Central visual representation of the AI agent
- **Features**:
  - 3D mouse-following animations
  - Status-based color changes (idle, listening, thinking, speaking)
  - Rotating rings with segment markers
  - Glowing effects and text shadows
- **Current State**: Purely visual, no backend integration

### StatusIndicator Component
- **Purpose**: Controls and displays current AI operational status
- **States**: idle, listening, thinking, speaking
- **Features**: Animated status transitions, manual state controls for demo
- **Backend Integration Needed**: Real-time status updates from AI processing

### AIMessages Component
- **Purpose**: Displays conversation history between user and AI
- **Current State**: Uses hardcoded mock messages
- **Backend Integration Needed**: Real-time message streaming, conversation persistence

### SystemLogs Component
- **Purpose**: Shows system activity and diagnostic information
- **Current State**: Displays static log entries
- **Backend Integration Needed**: Real-time log streaming, filtering, search

### ConnectionStatus Component
- **Purpose**: Monitors connection status to various backend services
- **Services Monitored**:
  - ELEVENLABS (Text-to-Speech)
  - N8N BACKEND (Workflow automation)
  - NEURAL NET (AI processing)
- **Current State**: Static status display
- **Backend Integration Needed**: Real-time health checks, connection monitoring

### WaveformVisualizer Component
- **Purpose**: Visual representation of voice activity
- **Features**: Animated waveform based on AI status
- **Backend Integration Needed**: Real audio input/output visualization

## Current State Analysis

### Frontend-Only Implementation
The application is currently a frontend-only interface with:
- Hardcoded data in all components
- Mock AI conversations and system logs
- Static connection statuses
- Manual status controls for demonstration

### Missing Backend Integration
The system requires backend services to become fully functional:

1. **AI Processing Service**: Handle natural language processing, intent recognition
2. **Voice Services**: Speech-to-text and text-to-speech integration
3. **Real-time Communication**: WebSocket or Server-Sent Events for live updates
4. **Data Persistence**: Store conversations, logs, and user preferences
5. **Authentication**: User management and session handling

## Backend Integration Guide

### Required API Endpoints

#### 1. AI Processing Endpoints

```typescript
// POST /api/chat/messages
interface ChatRequest {
  message: string;
  conversationId?: string;
  userId: string;
}

interface ChatResponse {
  message: string;
  conversationId: string;
  timestamp: string;
  status: 'processing' | 'completed' | 'error';
}

// GET /api/chat/conversations/:conversationId
interface ConversationResponse {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// WebSocket: /ws/chat
interface WSMessage {
  type: 'status_update' | 'message' | 'error';
  data: any;
}
```

#### 2. Voice Processing Endpoints

```typescript
// POST /api/voice/stt (Speech-to-Text)
interface STTRequest {
  audio: Blob;
  language?: string;
}

interface STTResponse {
  text: string;
  confidence: number;
  language: string;
}

// POST /api/voice/tts (Text-to-Speech)
interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

interface TTSResponse {
  audioUrl: string;
  duration: number;
}
```

#### 3. System Monitoring Endpoints

```typescript
// GET /api/system/status
interface SystemStatus {
  ai: 'idle' | 'listening' | 'thinking' | 'speaking';
  connections: {
    elevenlabs: 'connected' | 'pending' | 'disconnected';
    n8n: 'connected' | 'pending' | 'disconnected';
    neuralNet: 'connected' | 'pending' | 'disconnected';
  };
  latency: number;
  uptime: number;
}

// GET /api/system/logs
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

// WebSocket: /ws/system
interface SystemWSMessage {
  type: 'status_update' | 'log_entry' | 'connection_change';
  data: any;
}
```

### Integration Steps

#### Step 1: Set up API Client
Create a centralized API client using React Query:

```typescript
// src/lib/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const apiClient = {
  // Chat endpoints
  sendMessage: (data: ChatRequest) => fetch('/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  getConversation: (id: string) => fetch(`/api/chat/conversations/${id}`),

  // System endpoints
  getSystemStatus: () => fetch('/api/system/status'),
  getSystemLogs: () => fetch('/api/system/logs'),

  // Voice endpoints
  speechToText: (audio: Blob) => fetch('/api/voice/stt', {
    method: 'POST',
    body: audio
  }),

  textToSpeech: (data: TTSRequest) => fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};
```

#### Step 2: Update Components for Real Data

**AIMessages Component Integration:**
```typescript
const AIMessages = () => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: apiClient.getConversation,
    refetchInterval: 1000 // Poll for new messages
  });

  // WebSocket integration for real-time updates
  useEffect(() => {
    const ws = new WebSocket('/ws/chat');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        queryClient.invalidateQueries(['messages']);
      }
    };
    return () => ws.close();
  }, []);
};
```

**StatusIndicator Component Integration:**
```typescript
const StatusIndicator = ({ status, onStatusChange }) => {
  const { data: systemStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: apiClient.getSystemStatus,
    refetchInterval: 2000
  });

  // Use real status from backend instead of local state
  const currentStatus = systemStatus?.ai || status;
};
```

**ConnectionStatus Component Integration:**
```typescript
const ConnectionStatus = () => {
  const { data: status } = useQuery({
    queryKey: ['system-status'],
    queryFn: apiClient.getSystemStatus,
    refetchInterval: 5000
  });

  const connections = [
    { name: 'ELEVENLABS', status: status?.connections.elevenlabs || 'pending' },
    { name: 'N8N BACKEND', status: status?.connections.n8n || 'pending' },
    { name: 'NEURAL NET', status: status?.connections.neuralNet || 'connected' }
  ];
};
```

#### Step 3: Add Voice Integration

**Voice Input Handling:**
```typescript
const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const mutation = useMutation({
    mutationFn: apiClient.speechToText,
    onSuccess: (data) => {
      // Send transcribed text to AI
      sendMessage(data.text);
    }
  });

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    // Record and send audio to STT API
  };
};
```

**Voice Output Handling:**
```typescript
const useVoiceOutput = () => {
  const mutation = useMutation({
    mutationFn: apiClient.textToSpeech,
    onSuccess: (data) => {
      const audio = new Audio(data.audioUrl);
      audio.play();
    }
  });

  const speak = (text: string) => {
    mutation.mutate({ text });
  };
};
```

#### Step 4: Real-time Updates with WebSockets

Implement WebSocket connections for live updates:

```typescript
// src/hooks/useWebSocket.ts
export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };
    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
  }, [url]);

  return { messages, isConnected };
};
```

### Environment Configuration

Create environment variables for backend URLs:

```bash
# .env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_BASE_URL=ws://localhost:3001
VITE_ELEVENLABS_API_KEY=your_key_here
```

### Authentication Integration

Add authentication context and protected routes:

```typescript
// src/contexts/AuthContext.tsx
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Deployment Considerations

### Backend Requirements
- Node.js/Express or Python/FastAPI backend
- WebSocket support for real-time features
- Database for conversation and log storage
- Integration with AI services (OpenAI, Anthropic, etc.)
- Voice processing services (ElevenLabs, Google Speech, etc.)

### Frontend Build
```bash
npm run build
# Output goes to dist/ directory
```

### Environment Setup
- Configure API endpoints in production
- Set up CORS for cross-origin requests
- Implement proper error handling and loading states
- Add service worker for offline functionality (optional)

## Testing Strategy

### Unit Tests
- Component rendering and interactions
- API client functions
- Custom hooks behavior
- Utility functions

### Integration Tests
- API endpoint responses
- WebSocket connections
- Voice processing workflows
- Authentication flows

### E2E Tests
- Complete user journeys
- Voice interaction flows
- Real-time updates
- Error scenarios

## Future Enhancements

1. **Advanced AI Features**
   - Multi-modal inputs (text, voice, images)
   - Conversation memory and context
   - Personality customization

2. **Performance Optimizations**
   - Code splitting and lazy loading
   - Service worker for caching
   - Optimized bundle size

3. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

4. **Mobile App**
   - React Native implementation
   - Native voice processing
   - Push notifications

This documentation provides a comprehensive guide for understanding the L.N.X system and implementing the necessary backend integration to make it fully functional. The modular architecture makes it easy to integrate with various AI and voice services while maintaining the sophisticated frontend interface.
