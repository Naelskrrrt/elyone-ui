src/
├── app/
│ ├── hooks/ # Hooks globaux (custom hooks)
│ ├── providers/ # Providers pour les contextes globaux
│ ├── routes/ # Configuration des routes
│ └── App.tsx # Composant racine de l'application
│
├── core/ # Business logic (domaine pur)
│ ├── entities/ # Entités métiers (ex : User, Product)
│ ├── usecases/ # Cas d'utilisation (ex : GetUser, CreateOrder)
│ └── utils/ # Utils génériques non liés à React
│
├── features/ # Modules fonctionnels (feature-based)
│ └── featureName/ # Une feature isolée
│ ├── components/ # Composants spécifiques à cette feature
│ ├── hooks/ # Hooks spécifiques à cette feature
│ ├── services/ # Services de cette feature (APIs, adaptateurs)
│ ├── types/ # Types/Interfaces spécifiques
│ └── index.ts # Point d'entrée de la feature
│
├── shared/ # Code réutilisable
│ ├── components/ # Composants génériques
│ ├── styles/ # Fichiers CSS/SASS partagés
│ ├── icons/ # Icônes SVG
│ ├── contexts/ # Context API partagé
│ ├── hooks/ # Hooks réutilisables
│ ├── services/ # Services communs (ex : HTTP client, Logger)
│ └── types/ # Types globaux
│
├── infrastructure/ # Infrastructure technique
│ ├── api/ # Configuration des appels API
│ ├── http/ # HTTP client (ex : axios)
│ ├── storage/ # Gestion du stockage (localStorage, sessionStorage)
│ └── env/ # Gestion des variables d'environnement
│
├── index.html # Point d'entrée HTML
├── main.tsx # Point d'entrée JS/TS
├── vite.config.ts # Configuration de Vite
└── types.d.ts # Types globaux
