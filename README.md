# Orange LLM Studio

## 📝 Description

Cette application permet d'interagir avec différents agents d'IA pour répondre à vos questions et vous assister dans vos tâches. Un agent est une déclinaison de message envoyée à un LLM supportée par un system-prompt personnalisé et une base documentaire spécifique (afin de créer un RAG*).

**Ce projet est en chantier et sera régulièrement mis à jour !**

## ✨ Fonctionnalités

- 🤖 Multiples agents spécialisés
- 💬 Interface de conversation intuitive
- 📚 Consultation des sources documentaires
- 📊 Paramétrage des modèles (température, nombre de documents)
- 📤 Téléchargement de fichiers
- 🔍 Historique et gestion des conversations
- 👍 Système de feedback et d'évaluation des réponses

## 🚀 Installation

### Frontend

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/orange-llm-studio.git
cd orange-llm-studio

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev
```

### Backend

```bash
# Accéder au répertoire backend
cd backend

# Installer les dépendances Python (Python 3.8+ requis)
pip install -r requirements.txt

# Créer un fichier .env avec votre clé API OpenRouter
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Lancer le serveur backend
python server.py
```

## 💻 Technologies utilisées

### Frontend

- **Framework**: Next.js, React, TypeScript
- **UI**: Boosted (framework CSS basé sur Bootstrap)
- **Gestion d'état**: React Context API
- **Icônes**: Lucide React

### Backend

- **Framework**: Flask (Python)
- **API**: Integration avec OpenRouter API
- **Modèle LLM**: deepseek/deepseek-chat:free

## 🔧 Configuration

### Frontend

L'application nécessite une connexion au backend pour fonctionner correctement. Assurez-vous que le service backend est opérationnel avant d'utiliser l'application.

### Backend

Le backend nécessite une clé API OpenRouter valide. Configurez-la dans un fichier `.env` à la racine du répertoire backend :

```
OPENROUTER_API_KEY=your_api_key_here
```

## 🌐 API Endpoints

Le backend expose les endpoints suivants :

- **Check-health du backend**: `GET /api/health`
- **Chat (non-streaming)**: `POST /api/chat`
- **Chat (streaming)**: `POST /api/chat/stream`

Le streaming permet une expérience plus interactive où la réponse apparaît mot par mot.

## 👥 Utilisation

1. Sélectionnez un agent parmi ceux disponibles
2. Démarrez une nouvelle conversation ou reprenez une conversation existante
3. Posez vos questions dans la zone de saisie
4. Consultez les sources utilisées pour générer les réponses
5. Donnez votre feedback sur les réponses obtenues

## 📄 Licence

Un projet en solitaire et open-source réalisé pour Orange Business - Digital Services France.

Orange Boosted Framework est égalemnt open-source.

**Retrieval Augmented Generation*
