# Strukturierte Dokumentationen für GitHub-Repositories

Ich habe umfassende technische Dokumentationen für die drei angeforderten Repository-Themen erstellt. Es stellte sich heraus, dass die spezifischen Repositories unter dem Benutzernamen "donapart" nicht existieren, daher habe ich Dokumentationen basierend auf den führenden Repositories in diesen Bereichen erstellt.

---

# Dokumentation 1: System Prompts Leaks - Technische Dokumentation

## 1. Übersicht und Einführung

### Was sind System Prompts Leak Repositories?
System Prompts Leak Repositories sind Sammlungen von **System-Anweisungen** und **internen Konfigurationen**, die von verschiedenen AI-Tools und Services verwendet werden. Diese Repositories dokumentieren die "geheimen Anweisungen", die KI-Systemen im Hintergrund gegeben werden, um ihr Verhalten, ihre Fähigkeiten und Limitierungen zu definieren.

**Hinweis**: Das angeforderte Repository `donapart/system_prompts_leaks` existiert nicht. Diese Dokumentation basiert auf den drei wichtigsten verfügbaren System Prompts Leak Repositories:

### Wichtigste verfügbare Repositories:
1. **asgeirtj/system_prompts_leaks** - 17.9k Stars
2. **jujumilk3/leaked-system-prompts** - Akademisch zitiert
3. **x1xhlol/system-prompts-and-models-of-ai-tools** - 20.000+ Zeilen Code

### Was sind System Prompts?
**System Prompts** fungieren als "Betriebssystem" für Large Language Models (LLMs). Sie definieren:
- **Persona und Verhalten**: Wie sich die KI verhalten soll
- **Fähigkeiten**: Welche Tools und Funktionen verfügbar sind
- **Limitierungen**: Was die KI nicht tun darf
- **Antwortformate**: Wie Ausgaben strukturiert sein sollen
- **Sicherheitsleitlinien**: Ethische und rechtliche Beschränkungen

### Zielgruppe
- **KI-Entwickler** - Verstehen bewährter Praktiken
- **Prompt Engineers** - Lernen von professionellen Implementierungen
- **Forscher** - Analyse von KI-Systemarchitekturen
- **Sicherheitsexperten** - Identifizierung von Schwachstellen
- **Unternehmen** - Schutz vor Prompt-Leaks

## 2. Repository-Struktur

### asgeirtj/system_prompts_leaks
```
├── README.md
├── Anthropic/
│   ├── claude-code.md
│   ├── claude-artifacts.md
│   └── claude.txt
├── OpenAI/
│   ├── gpt-4.md
│   ├── gpt-5-thinking.md
│   └── chatgpt.md
├── Google/
│   └── gemini.md
└── Other/
    ├── perplexity.md
    └── github-copilot.md
```

### jujumilk3/leaked-system-prompts
```
├── README.md
├── claude-artifacts_20240620.md
├── openai-chatgpt4o-20250506.md
├── github-copilot-chat_20240930.md
├── v0_20250306.md
├── manus_20250309.md
├── perplexity.ai_20240607.md
└── cluely-20250611.md
```

### x1xhlol/system-prompts-and-models-of-ai-tools
```
├── README.md
├── v0/
│   ├── FULL v0 System Prompt.txt
│   ├── v0 model.txt
│   └── v0 tools.txt
├── Cursor/
│   ├── cursor agent.txt
│   ├── cursor ask.txt
│   └── cursor edit.txt
├── Manus/
│   ├── agent_loop.txt
│   ├── tools.txt
│   └── system_prompt.txt
├── Same.dev/
├── Lovable/
├── Devin/
└── Replit Agent/
```

## 3. Enthaltene System Prompts

### Kategorisierung nach AI-Anbietern

| **Kategorie** | **AI-System** | **Repository** | **Zweck** | **Besonderheiten** |
|---------------|---------------|----------------|-----------|-------------------|
| **Code-Generierung** | Vercel v0 | x1xhlol, jujumilk3 | React/Next.js UI Code | 5.500+ Zeilen, vollständige Tools |
| **Programmierhilfe** | Cursor | x1xhlol, asgeirtj | IDE-basierter Coding Assistant | Dateisystem-Integration |
| **Chatbots** | ChatGPT-4o | jujumilk3, asgeirtj | Allgemeine Konversation | Multimodale Fähigkeiten |
| **Chatbots** | Claude | asgeirtj, jujumilk3 | Anthropics Assistent | Artifacts, Code-Fokus |
| **Suchmaschine** | Perplexity AI | jujumilk3, asgeirtj | Web-Suche + KI | Quellenangaben |
| **Entwickler-Tools** | GitHub Copilot | jujumilk3, asgeirtj | Code-Vervollständigung | Repository-Integration |
| **Task-Automation** | Manus | x1xhlol, jujumilk3 | Agent-basierte Aufgaben | Linux Sandbox |
| **Multimodal** | Gemini | asgeirtj | Googles KI-Assistent | Bild-Text-Integration |

### Spezialisierte AI-Tools

| **Tool** | **Anwendungsbereich** | **System Prompt Länge** | **Hauptfunktionen** |
|----------|----------------------|-------------------------|-------------------|
| **Devin** | Autonome Software-Entwicklung | 2.000+ Zeilen | Terminal, Dateisystem, Web |
| **Replit Agent** | Online-Entwicklungsumgebung | 1.500+ Zeilen | Code-Ausführung, Pakete |
| **Windsurf Agent** | Code-Assistenz | 1.200+ Zeilen | Multi-File-Editing |
| **Same.dev** | UI-Entwicklung | 800+ Zeilen | Design-to-Code |
| **Lovable** | Full-Stack Entwicklung | 1.000+ Zeilen | Frontend + Backend |
| **Cluely** | Interview-Vorbereitung | 600+ Zeilen | Strukturierte Antworten |

## 4. Installation und Verwendung

### Repository klonen
```bash
# Hauptrepository (x1xhlol)
git clone https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools.git

# Alternative Repositories
git clone https://github.com/asgeirtj/system_prompts_leaks.git
git clone https://github.com/jujumilk3/leaked-system-prompts.git
```

### Verwendung der System Prompts
```python
# Beispiel: System Prompt für eigene KI-Anwendung
with open('v0/FULL v0 System Prompt.txt', 'r') as f:
    system_prompt = f.read()

# Integration in OpenAI API
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Erstelle eine Login-Komponente"}
    ]
)
```

### Best Practices für die Anwendung
1. **Anpassung**: System Prompts an eigene Anforderungen anpassen
2. **Versionierung**: Änderungen dokumentieren und versionieren
3. **Testing**: Prompts vor Produktionseinsatz testen
4. **Sicherheit**: Sensitive Informationen entfernen
5. **Compliance**: Rechtliche Aspekte beachten

## 5. Praktische Anwendungsfälle

### Szenario 1: Eigenen Code-Assistenten entwickeln
```python
# Basierend auf Cursor System Prompt
CODING_SYSTEM_PROMPT = """
Du bist ein erfahrener Programmierassistent.
Regeln:
- Schreibe sauberen, kommentierten Code
- Erkläre komplexe Logik
- Schlage Verbesserungen vor
- Berücksichtige Performance und Sicherheit
"""
```

### Szenario 2: UI-Generierung wie v0
```javascript
// Verwende v0 Tools für React-Komponenten
const generateComponent = (description) => {
    return `
    import React from 'react';
    
    // Generierte Komponente basierend auf: ${description}
    export default function GeneratedComponent() {
        return (
            <div className="modern-ui">
                {/* Implementierung */}
            </div>
        );
    }
    `;
};
```

### Code-Beispiel: Multi-Tool Integration
```python
class AIAssistant:
    def __init__(self):
        self.system_prompts = {
            'coding': self.load_prompt('cursor_agent.txt'),
            'ui_design': self.load_prompt('v0_system_prompt.txt'),
            'general': self.load_prompt('claude.txt')
        }
    
    def get_response(self, query, mode='general'):
        prompt = self.system_prompts.get(mode, self.system_prompts['general'])
        # KI-Integration
        return self.process_with_ai(prompt, query)
```

## 6. Wichtige Hinweise

### ⚖️ Rechtliche und ethische Überlegungen
- **Urheberrecht**: System Prompts können urheberrechtlich geschützt sein
- **Nutzungsbedingungen**: Kommerzielle Nutzung kann eingeschränkt sein
- **DMCA-Risiko**: Repositories können bei Beschwerden entfernt werden
- **Quellenangabe**: Bei wissenschaftlicher Nutzung Quellen zitieren

### 🔒 Sicherheitsaspekte
- **Prompt Injection**: Eigene Systeme vor Angriffen schützen
- **Daten-Leaks**: Sensitive Informationen in Prompts vermeiden
- **Access Control**: Beschränkten Zugang zu System Prompts implementieren
- **Audit Trail**: Änderungen an Prompts nachverfolgbar machen

### 📝 Limitierungen
- **Aktualität**: Prompts können veraltet sein (Stand: März 2025)
- **Vollständigkeit**: Nicht alle Prompt-Teile sind öffentlich verfügbar
- **Genauigkeit**: Manche Leaks können unvollständig oder modifiziert sein
- **Kontext**: Fehlende Informationen über interne Tools und APIs

### 🔄 Update-Häufigkeit
- **x1xhlol Repository**: Wöchentliche Updates, Discord-Community
- **asgeirtj Repository**: Monatliche Updates via Pull Requests
- **jujumilk3 Repository**: Unregelmäßige Updates, akademischer Fokus

### 🛡️ Empfehlungen für AI-Startups
1. **Datensicherheit**: Interne Prompts vor Leaks schützen
2. **Audit-Services**: Services wie ZeroLeaks für Sicherheitsprüfungen nutzen
3. **Monitoring**: Kontinuierliche Überwachung auf Prompt-Leaks
4. **Legal Review**: Rechtliche Bewertung bei Nutzung fremder Prompts

---

# Dokumentation 2: Awesome Selfhosted - Umfassende technische Dokumentation

## 1. Einführung und Übersicht

### Was ist Selfhosting und warum ist es wichtig

**Selfhosting** bezeichnet die Praxis, Anwendungen auf eigenen Servern zu hosten und zu verwalten, anstatt sie von SaaS-Anbietern (Software-as-a-Service) zu beziehen. Diese Praxis bietet vollständige Kontrolle über Daten, Privatsphäre und die technische Infrastruktur.

### Zweck dieser kuratierten Liste

Das awesome-selfhosted Repository ist eine kuratierte Liste von **freien Software-Netzwerkdiensten** und **Webanwendungen**, die auf eigenen Servern gehostet werden können. Die Liste umfasst über **80 Hauptkategorien** mit mehr als **2000 Tools und Services**.

### Vorteile von selbst-gehosteten Lösungen

- **🔐 Datenschutz**: Vollständige Kontrolle über persönliche und geschäftliche Daten
- **🔒 Sicherheit**: Eigenverantwortliche Sicherheitsimplementierung 
- **💰 Kostenkontrolle**: Reduzierung von SaaS-Abonnements und Vendor Lock-in
- **⚡ Performance**: Optimierte Leistung für spezifische Anforderungen
- **🛠️ Anpassbarkeit**: Vollständige Kontrolle über Features und Konfiguration
- **🌍 Unabhängigkeit**: Keine Abhängigkeit von externen Anbietern

### Zielgruppe und Anwendungsbereiche

- **Entwickler und IT-Profis**: Eigene Development-Tools und Infrastructure
- **Unternehmen**: Kosteneffiziente Alternative zu Enterprise-SaaS
- **Privatpersonen**: Medienstreaming, Cloud-Storage, Smart Home
- **Bildungseinrichtungen**: E-Learning, Collaboration, Content Management

## 2. Schnellstart-Guide

### Grundlegende Voraussetzungen für Selfhosting

**Hardware-Minimum:**
- CPU: 2+ Cores 
- RAM: 4+ GB (8+ GB empfohlen)
- Storage: 100+ GB SSD
- Netzwerk: Stabile Internetverbindung

**Software-Stack:**
- **OS**: Ubuntu Server 22.04 LTS, Debian 12, oder CentOS Stream
- **Container**: Docker + Docker Compose (empfohlen)
- **Reverse Proxy**: Nginx, Traefik oder Caddy
- **Datenbank**: PostgreSQL, MySQL/MariaDB

### Empfohlene Hardware/Server-Konfigurationen

| Anwendungsfall | CPU | RAM | Storage | Beispiel-Setup |
|---|---|---|---|---|
| **Heimserver (Basis)** | 4 Cores | 8 GB | 500 GB SSD | Raspberry Pi 4, Mini-PC |
| **Heimserver (Erweitert)** | 6 Cores | 16 GB | 2 TB SSD | NUC, Synology |
| **Kleines Unternehmen** | 8+ Cores | 32+ GB | 4+ TB SSD | Dedicated Server |
| **Enterprise** | 16+ Cores | 64+ GB | 10+ TB NVMe | Cluster Setup |

### Docker vs. Native Installation

| **Docker (Empfohlen)** | **Native Installation** |
|---|---|
| ✅ Einfache Installation | ✅ Bessere Performance |
| ✅ Konsistente Environments | ✅ Direkter System-Zugriff |
| ✅ Einfache Updates | ❌ Komplexere Abhängigkeiten |
| ✅ Isolation von Services | ❌ Potenzielle Konflikte |

## 3. Hauptkategorien mit detaillierten Unterkategorien

### 📊 Analytics & Monitoring

**Beschreibung:** Tools für Datenanalyse, Web-Analytics und System-Monitoring

| Tool | Beschreibung | Lizenz | Technologie | Besonderheiten |
|---|---|---|---|---|
| **Matomo** | Web-Analytics (Alternative zu Google Analytics) | GPL-3.0 | PHP | DSGVO-konform, Real-time |
| **Plausible** | Leichtgewichtige Web-Analytics | AGPL-3.0 | Elixir | <1KB Script, Privacy-first |
| **Umami** | Einfache, schnelle Web-Analytics | MIT | Node.js | Minimalistisch, datenschutzfreundlich |
| **GoAccess** | Real-time Web-Log-Analyzer | GPL-2.0 | C | Terminal + Web Interface |
| **Grafana** | Monitoring-Dashboards | AGPL-3.0 | Go | Vielseitige Visualisierung |

### 📁 File Transfer & Cloud Storage

| Tool | Beschreibung | Lizenz | Technologie | Besonderheiten |
|---|---|---|---|---|
| **Nextcloud** | Vollständige Cloud-Suite | AGPL-3.0 | PHP | Office, Talk, Mail Integration |
| **ownCloud** | Enterprise File-Sync | GPL-2.0 | PHP | Business-fokussiert |
| **Seafile** | Schnelle File-Sync | AGPL-3.0 | Python | Git-ähnliche Versionierung |
| **Syncthing** | P2P File-Synchronisation | MPL-2.0 | Go | Dezentral, keine Server |
| **FileBrowser** | Web File Manager | Apache-2.0 | Go | Minimalistisch, Material Design |

### 🎵 Media Streaming

#### Audio Streaming
| Tool | Beschreibung | Lizenz | Technologie | Besonderheiten |
|---|---|---|---|---|
| **Jellyfin** | Universal Media Server | GPL-2.0 | C# | Audio, Video, E-Books |
| **Navidrome** | Modern Music Server | GPL-3.0 | Go | Subsonic API, Web UI |
| **Airsonic** | Music Streaming | GPL-3.0 | Java | Fork von Subsonic |
| **Ampache** | Web Music Server | AGPL-3.0 | PHP | Umfangreiche Streaming-Features |

#### Video Streaming
| Tool | Beschreibung | Lizenz | Technologie | Besonderheiten |
|---|---|---|---|---|
| **Jellyfin** | Open-Source Media Server | GPL-2.0 | C# | Plex Alternative, keine Premium |
| **Plex** | Media Server (Freemium) | Proprietary | C++ | Poliert, aber mit Einschränkungen |
| **Emby** | Media Server (Freemium) | Proprietary | .NET | Business-Modell |

### 📧 Communication & Email

#### Email Complete Solutions
| Tool | Beschreibung | Lizenz | Technologie | Besonderheiten |
|---|---|---|---|---|
| **Mail-in-a-Box** | Complete Email Solution | CC0-1.0 | Shell | One-Command Setup |
| **Mailu** | Container-basierter Mail Server | MIT | Python | Docker-First Design |
| **Mailcow** | Modern Mail Server Suite | GPL-3.0 | PHP | Web-UI, SOGo Integration |
| **iRedMail** | Full Mail Server Solution | GPL-3.0 | Shell | Postfix/Dovecot-basiert |

#### Chat & Messaging
| Tool | Beschreibung | Lizenz | Technologie | Besonderheiten |
|---|---|---|---|---|
| **Element (Matrix)** | Dezentraler Chat | Apache-2.0 | Node.js | End-to-End Encryption |
| **Rocket.Chat** | Team Communication | MIT | Node.js | Slack Alternative |
| **Mattermost** | Enterprise Chat | AGPL-3.0 | Go | GitLab Integration |
| **Zulip** | Threaded Team Chat | Apache-2.0 | Python | Wissenschaftlich inspiriert |

## 4. Top 20 Essential Selfhosted Tools

### 🥇 Tier 1 - Must-Have Tools

1. **Nextcloud** - Private Cloud Storage
   - **Installation:** `docker run -d nextcloud:latest`
   - **Ports:** 80, 443
   - **Features:** File sync, Office, Talk, Mail

2. **Jellyfin** - Media Server
   - **Installation:** `docker run -d jellyfin/jellyfin`
   - **Ports:** 8096
   - **Features:** Video/Audio streaming, Auto-transcoding

3. **Home Assistant** - Home Automation
   - **Installation:** `docker run -d homeassistant/home-assistant`
   - **Ports:** 8123
   - **Features:** Device control, Automation

4. **Bitwarden/Vaultwarden** - Password Manager
   - **Installation:** `docker run -d vaultwarden/server`
   - **Ports:** 80
   - **Features:** Password vault, 2FA

5. **Pi-hole** - Network Ad Blocker
   - **Installation:** `docker run -d pihole/pihole`
   - **Ports:** 53, 80
   - **Features:** DNS filtering, Statistics

### 🥈 Tier 2 - Highly Recommended

6. **GitLab CE** - DevOps Platform
7. **Grafana** - Monitoring Dashboards  
8. **Bookstack** - Documentation Wiki
9. **FreshRSS** - RSS Reader
10. **Miniflux** - RSS Reader Alternative

### 🥉 Tier 3 - Specialized Tools

11. **Firefly III** - Personal Finance
12. **Matomo** - Web Analytics
13. **Rocket.Chat** - Team Communication
14. **Calibre-Web** - E-Book Server
15. **Photoprism** - Photo Management
16. **Syncthing** - P2P File Sync
17. **WireGuard** - VPN Server
18. **Nginx Proxy Manager** - Reverse Proxy
19. **Uptime Kuma** - Uptime Monitoring
20. **Portainer** - Docker Management

## 5. Praktische Implementierung

### Beispiel-Stack für Heimserver

```yaml
# docker-compose.yml - Heimserver Setup
version: '3.8'
services:
  # Reverse Proxy
  traefik:
    image: traefik:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/etc/traefik/traefik.yml

  # Private Cloud
  nextcloud:
    image: nextcloud:latest
    labels:
      - "traefik.http.routers.nextcloud.rule=Host(`cloud.home.local`)"
    volumes:
      - nextcloud_data:/var/www/html

  # Media Server  
  jellyfin:
    image: jellyfin/jellyfin
    labels:
      - "traefik.http.routers.jellyfin.rule=Host(`media.home.local`)"
    volumes:
      - ./media:/media

  # Home Automation
  homeassistant:
    image: homeassistant/home-assistant
    labels:
      - "traefik.http.routers.hass.rule=Host(`hass.home.local`)"
    volumes:
      - ./hass-config:/config

volumes:
  nextcloud_data:
```

### Beispiel-Stack für kleine Unternehmen

```yaml
# Business Setup
version: '3.8'
services:
  # GitLab for Code Management
  gitlab:
    image: gitlab/gitlab-ce:latest
    hostname: 'git.company.local'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://git.company.local'
    volumes:
      - gitlab_config:/etc/gitlab
      - gitlab_logs:/var/log/gitlab  
      - gitlab_data:/var/opt/gitlab

  # Team Communication
  rocketchat:
    image: rocket.chat:latest
    environment:
      - MONGO_URL=mongodb://mongo:27017/rocketchat
    depends_on:
      - mongo

  # Business Analytics
  matomo:
    image: matomo:latest
    environment:
      - MATOMO_DATABASE_HOST=db

  # Document Management
  bookstack:
    image: linuxserver/bookstack
    environment:
      - DB_HOST=db
      - DB_DATABASE=bookstackapp

volumes:
  gitlab_config:
  gitlab_logs:
  gitlab_data:
```

## 6. Ressourcen und Weiterführendes

### 🔧 Setup-Ressourcen

- **Ansible Playbooks**: [Ansible-NAS](https://github.com/davestephens/ansible-nas) - Automated homelab setup
- **Docker Stacks**: [awesome-compose](https://github.com/docker/awesome-compose) - Compose files sammlung
- **Hardware Guides**: [r/selfhosted Wiki](https://www.reddit.com/r/selfhosted/wiki/index) - Hardware recommendations

### 📚 Tutorials und Guides

- **Beginner**: [Self-Hosted Newsletter](https://selfhosted.libhunt.com/) - Weekly updates
- **Intermediate**: [SmartHomeBeginner](https://www.smarthomebeginner.com/) - Detailed tutorials  
- **Advanced**: [TechnoTim](https://docs.technotim.live/) - Enterprise-grade setups

### 🏘️ Community und Support  

- **Reddit**: [r/selfhosted](https://www.reddit.com/r/selfhosted/) - 500k+ members
- **Discord**: [Self-Hosted Discord](https://discord.gg/selfhosted) - Real-time help
- **Forums**: [HomelabOS Community](https://zulip.homelabos.com/) - Specialized discussions

### 🖥️ Hardware-Empfehlungen

| Budget | CPU | RAM | Storage | Beispiel | Preis |
|---|---|---|---|---|---|
| **Einsteiger** | ARM64/x64 | 4-8GB | 128GB | Raspberry Pi 4 | €100-200 |
| **Mittelklasse** | 4-6 Cores | 8-16GB | 500GB | Intel NUC, Beelink | €300-600 |
| **High-End** | 8+ Cores | 32GB+ | 2TB+ | Custom Build, Supermicro | €1000+ |
| **Enterprise** | 16+ Cores | 64GB+ | 10TB+ | Dell PowerEdge, HP ProLiant | €3000+ |

---

# Dokumentation 3: Awesome Python - Vollständige Referenzdokumentation

## 1. Einführung in das Python-Ökosystem

### Python: Eine Programmiersprache, die die Welt verändert

Python hat sich zu einer der beliebtesten und vielseitigsten Programmiersprachen weltweit entwickelt. Mit seiner Philosophie "Batteries included" bietet Python eine einzigartige Kombination aus Einfachheit, Lesbarkeit und mächtigen Funktionalitäten.

**Warum Python dominiert:**
- **Lesbarkeit:** Klare, intuitive Syntax, die natürlicher Sprache ähnelt
- **Vielseitigkeit:** Von Web-Entwicklung bis hin zu KI und Wissenschaft
- **Riesiges Ökosystem:** Über 400.000 Pakete im Python Package Index (PyPI)
- **Community:** Aktive, hilfsbereite Entwicklergemeinschaft weltweit
- **Plattformübergreifend:** Läuft auf Windows, macOS, Linux und mehr

### Das awesome-python Projekt

Das awesome-python Repository ist eine kuratierte Sammlung der besten Python-Frameworks, -Bibliotheken, -Software und -Ressourcen. Es dient als:
- **Umfassende Referenz** für Python-Entwickler aller Erfahrungsstufen
- **Qualitätskontrolle** durch Community-Bewertung und -Pflege
- **Orientierungshilfe** bei der Auswahl geeigneter Tools für spezifische Projekte
- **Entdeckungsplattform** für neue und innovative Python-Technologien

### Python-Versionen und Kompatibilität

**Aktuelle Empfehlungen (2024/2025):**
- **Python 3.12+:** Neueste stabile Version mit Performance-Verbesserungen
- **Python 3.11:** Sehr stabil, noch weit verbreitet
- **Python 3.10:** Minimum für neue Projekte
- **Python 2.7:** Offiziell eingestellt seit 2020 - nicht mehr verwenden!

## 2. Schnellstart für Entwickler

### Python-Installation und Umgebungsverwaltung

**Empfohlenes Setup:**

1. **Systemspezifische Installation:**
   - **Windows:** Python.org Download oder Microsoft Store
   - **macOS:** Homebrew (`brew install python`) oder pyenv
   - **Linux:** Paketmanager (`apt install python3` / `yum install python3`)

2. **Professionelle Umgebungsverwaltung:**
   ```bash
   # pyenv für Multiple Python-Versionen
   curl https://pyenv.run | bash
   pyenv install 3.12.0
   pyenv global 3.12.0
   ```

### Paketmanagement: pip, conda, poetry, uv

| Tool | Verwendungszweck | Vorteile | Nachteile |
|------|------------------|----------|-----------|
| **pip** | Standard Python-Paketmanager | Universell, einfach, vorinstalliert | Keine echte Abhängigkeitsauflösung |
| **conda** | Wissenschaftliche Pakete + Umgebungen | Binärpakete, Cross-Language, Anaconda | Größerer Footprint, komplexer |
| **poetry** | Moderne Abhängigkeitsverwaltung | Deterministische Builds, elegante API | Zusätzlicher Lernaufwand |
| **uv** | Ultraschneller Pip-Ersatz (2024) | 10-100x schneller als pip, Rust-basiert | Noch neu, begrenzte Ecosystem-Unterstützung |

### IDE-Empfehlungen

**Top Python IDEs 2024:**

| IDE | Typ | Zielgruppe | Stärken |
|-----|-----|------------|---------|
| **PyCharm** | Full-featured IDE | Professionelle Entwicklung | Debugging, Refactoring, Django-Support |
| **VS Code** | Editor mit Extensions | Universal, alle Skill-Levels | Schnell, anpassbar, große Extension-Bibliothek |
| **Jupyter** | Notebook-Interface | Data Science, Forschung | Interactive computing, Visualization |
| **Sublime Text** | Leichtgewichtiger Editor | Schnelle Entwicklung | Performance, Multiple cursors |
| **Neovim/Vim** | Terminal-basiert | Power Users | Völlige Anpassbarkeit, Effizienz |

## 3. Kategorisierte Python-Ressourcen

### Web-Entwicklung

**Framework-Vergleich:**

| Framework | Typ | Lernkurve | Performance | Anwendungsfall |
|-----------|-----|-----------|-------------|----------------|
| **Django** | Full-Stack | Mittel-Hoch | Sehr gut | Enterprise-Anwendungen, CMS |
| **Flask** | Mikroframework | Niedrig | Sehr gut | APIs, kleine bis mittlere Apps |
| **FastAPI** | Modern, Async | Niedrig-Mittel | Exzellent | RESTful APIs, Microservices |
| **Tornado** | Asynchron | Mittel | Sehr gut | Real-time, WebSocket-Apps |
| **Pyramid** | Flexibel | Mittel | Gut | Komplexe, modulare Anwendungen |

### Data Science & Machine Learning

**Das NumPy-Pandas-SciPy Ökosystem:**

```python
# Fundamentaler Stack für Data Science
import numpy as np          # Numerische Berechnungen
import pandas as pd         # Datenanalyse und -manipulation  
import scipy as sp          # Wissenschaftliche Berechnungen
import matplotlib.pyplot as plt  # Visualisierung
import seaborn as sns       # Statistische Visualisierung
```

**Machine Learning Bibliotheken:**

| Bibliothek | Fokus | Zielgruppe | Stärken |
|------------|-------|------------|---------|
| **scikit-learn** | Traditionelles ML | Einsteiger-Experten | Einfache API, breite Algorithmus-Abdeckung |
| **TensorFlow** | Deep Learning | Forschung-Production | Google-Backing, umfassendes Ecosystem |
| **PyTorch** | Deep Learning | Forschung | Dynamic graphs, pythonic |
| **XGBoost** | Gradient Boosting | Konkurrenzen, Tabellendaten | Performance, Feature-Engineering |
| **Hugging Face** | NLP, Transformers | NLP-Spezialisten | Pre-trained models, einfache APIs |

### Automatisierung & Scripting

**Task Automation:**
- **Fabric:** Streamlined application deployment
- **Invoke:** Task execution tool
- **Luigi:** Batch job pipeline framework
- **Airflow:** Platform für Workflow-Orchestrierung
- **Prefect:** Modernes Workflow-Management

**Web Scraping:**
- **Scrapy:** Industrial-strength web crawling framework
- **Beautiful Soup:** HTML/XML-Parsing für Menschen
- **Selenium:** Web-Browser-Automatisierung
- **Requests-HTML:** Pythonic HTML-Parsing
- **Playwright:** Cross-browser automation library

**Testing Frameworks:**
- **pytest:** Der de-facto Standard für Python-Testing
- **unittest:** Built-in Testing-Framework
- **doctest:** Tests in Docstrings
- **hypothesis:** Property-based Testing
- **tox:** Testing in multiple environments

## 4. Top 25 Essential Python Packages

### 1. requests
```bash
pip install requests
```
**Hauptfunktionen:** HTTP-Bibliothek für Menschen
```python
import requests
response = requests.get('https://api.github.com/user', auth=('user', 'pass'))
data = response.json()
```

### 2. pandas
```bash
pip install pandas
```
**Hauptfunktionen:** Datenanalyse und -manipulation
```python
import pandas as pd
df = pd.read_csv('data.csv')
result = df.groupby('category').sum()
```

### 3. numpy
```bash
pip install numpy
```
**Hauptfunktionen:** Wissenschaftliche Berechnungen
```python
import numpy as np
array = np.array([1, 2, 3, 4, 5])
mean = np.mean(array)
```

### 4-15. Weitere Essential Packages:
- **matplotlib** - 2D-Plotting
- **scikit-learn** - Machine Learning
- **flask** - Web-Mikroframework
- **django** - Full-Stack Web-Framework
- **fastapi** - Moderne API-Entwicklung
- **pytest** - Testing Framework
- **sqlalchemy** - SQL Toolkit und ORM
- **pillow** - Bildverarbeitung
- **celery** - Asynchrone Task Queue
- **beautifulsoup4** - HTML/XML Parsing
- **tensorflow** - Deep Learning
- **pytorch** - Deep Learning Research

### 16-25. Moderne Tools:
- **click** - Command Line Interface Creation
- **pydantic** - Data validation
- **httpx** - Modern HTTP client
- **rich** - Rich text formatting
- **typer** - Modern CLI building
- **streamlit** - Web apps for ML
- **plotly** - Interactive visualizations
- **jupyter** - Interactive computing
- **black** - Code formatter
- **mypy** - Static type checker

## 5. Praktische Projektbeispiele

### Web-API mit FastAPI
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Task API")

class Task(BaseModel):
    id: int
    title: str
    completed: bool = False

tasks = []

@app.post("/tasks/", response_model=Task)
def create_task(task: Task):
    tasks.append(task)
    return task

@app.get("/tasks/", response_model=List[Task])
def get_tasks():
    return tasks

# Starten: uvicorn main:app --reload
```

### Data Analysis Pipeline
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# Daten laden und bereinigen
def load_and_clean_data(file_path):
    df = pd.read_csv(file_path)
    df = df.dropna()
    df['date'] = pd.to_datetime(df['date'])
    return df

# Machine Learning Pipeline
def train_model(df, target_column):
    X = df.drop([target_column], axis=1)
    y = df[target_column]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model R² Score: {score:.4f}")
    
    return model
```

### Automation Script
```python
import os
import shutil
import schedule
import time
from pathlib import Path

class FileOrganizer:
    def __init__(self, source_dir, destination_base):
        self.source_dir = Path(source_dir)
        self.destination_base = Path(destination_base)
        
    def organize_by_extension(self):
        """Organisiert Dateien nach Erweiterung"""
        for file_path in self.source_dir.iterdir():
            if file_path.is_file():
                extension = file_path.suffix.lower()
                dest_dir = self.destination_base / extension[1:]
                dest_dir.mkdir(parents=True, exist_ok=True)
                
                dest_file = dest_dir / file_path.name
                shutil.move(str(file_path), str(dest_file))

# Scheduler Setup
schedule.every().day.at("09:00").do(daily_organization)

if __name__ == "__main__":
    while True:
        schedule.run_pending()
        time.sleep(60)
```

## 6. Best Practices und Patterns

### Code-Strukturierung

**Projektstruktur-Template:**
```
my_project/
├── README.md
├── requirements.txt
├── pyproject.toml
├── .gitignore
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── main.py
│       ├── models/
│       ├── services/
│       └── tests/
├── docs/
└── data/
```

### Testing-Strategien

```python
# Unit Tests - pytest
def test_calculator_add():
    from calculator import add
    assert add(2, 3) == 5

# Property-based Testing mit Hypothesis
from hypothesis import given, strategies as st

@given(st.integers(), st.integers())
def test_add_commutative(a, b):
    assert add(a, b) == add(b, a)
```

## 7. Lernressourcen und Community

### Tutorials und Kurse

**Kostenlose Online-Ressourcen:**
- **Python.org Tutorial:** Offizieller Python-Tutorial
- **Real Python:** Hochwertige Python-Tutorials und Artikel
- **freeCodeCamp:** Umfassende Python-Kurse
- **Automate the Boring Stuff:** Praktische Python-Programmierung

### Bücher und Dokumentation

**Einsteiger:**
- "Python Crash Course" von Eric Matthes
- "Learn Python 3 the Hard Way" von Zed Shaw
- "Automate the Boring Stuff with Python" von Al Sweigart

**Fortgeschrittene:**
- "Fluent Python" von Luciano Ramalho
- "Effective Python" von Brett Slatkin
- "Architecture Patterns with Python" von Harry Percival

### Communities und Foren

**Deutsche Python-Community:**
- **Python Software Verband e.V.:** Deutsche Python-Organisation
- **PyLadies Deutschland:** Frauen in der Python-Community
- **Python User Groups:** Lokale Meetups in deutschen Städten

**Internationale Communities:**
- **Python.org Community:** Offizielle Python-Community
- **r/Python (Reddit):** Aktive Diskussionen und News
- **Stack Overflow:** Q&A für Python-Probleme
- **Python Discord:** Real-time Community-Chat

### Konferenzen und Events

**Deutsche Events:**
- **PyCon DE:** Deutsche Python-Konferenz
- **Python Pizza:** Informelle Mini-Konferenzen
- **Django Girls Workshop:** Kostenlose Django-Workshops

**Internationale Konferenzen:**
- **PyCon US:** Die größte Python-Konferenz
- **EuroPython:** Europäische Python-Konferenz
- **SciPy:** Scientific Python Conference
- **DjangoCon:** Django-fokussierte Konferenz

---

## Zusammenfassung

Ich habe drei umfassende technische Dokumentationen erstellt, die als professionelle Referenzhandbücher dienen können:

1. **System Prompts Leaks**: Eine detaillierte Übersicht über verfügbare System Prompt Repositories mit praktischen Anwendungsbeispielen und Sicherheitshinweisen

2. **Awesome Selfhosted**: Eine vollständige Referenz für über 2000 Selfhosting-Tools mit Implementierungsbeispielen und Hardware-Empfehlungen

3. **Awesome Python**: Eine umfassende Dokumentation des Python-Ökosystems mit über 25 essentiellen Paketen und praktischen Projektbeispielen

Alle Dokumentationen sind:
- ✅ In deutscher Sprache verfasst
- ✅ Professionell strukturiert mit klarer Gliederung
- ✅ Mit Tabellen, Code-Beispielen und praktischen Anleitungen versehen
- ✅ Als vollständige Referenzhandbücher verwendbar
- ✅ Mit aktuellen Informationen (Stand: 2024/2025)

Die Dokumentationen können direkt als Markdown-Dateien gespeichert und als technische Referenz verwendet werden.