# Système de Thèmes StreamLayer

Le système de thèmes de StreamLayer est conçu pour être à la fois simple pour l'utilisateur et techniquement robuste, garantissant un rendu premium et une accessibilité optimale.

## Concept de Base

L'interface est pilotée par seulement deux couleurs :

1. **`primary`** : La couleur d'ambiance globale. Elle est utilisée pour les surfaces de fond (`bg-primary`).
2. **`secondary`** : La couleur d'action et d'interaction. Elle est utilisée pour les boutons, les curseurs et les éléments actifs.

## Fonctionnement Technique

### 1. Extraction et Luminosité (TypeScript)

Le processus commence dans `src/utils/ui.ts` avec la fonction `generateThemeVariables(theme)`. 

- Elle convertit vos couleurs en variables CSS brutes (`--primary-raw`, `--secondary-raw`).
- Elle calcule la luminosité via le **modèle HSP**.
- Elle définit un flag `--sl-bg-is-light` (0 ou 1) qui sert de switch binaire pour tout le CSS.

### 2. Le Pipeline `color-mix` (CSS)

Le cœur de la logique réside dans `src/styles/design-tokens.css`. Nous utilisons massivement la fonction native CSS `color-mix()` pour créer une harmonie parfaite :

#### La couleur de mélange (`--bg-mix-color`)

Nous définissons une couleur pivot qui s'adapte à ton thème :

- Si ton fond est clair, on mélange avec un blanc cassé (`#f8fafc`).
- Si ton fond est sombre, on mélange avec du noir.
  Cela permet aux nuances de rester naturelles que tu choisisses un thème "Light" ou "Dark".

#### Dérivation des surfaces

Toutes les surfaces sont des dérivées de ta couleur `primary` :

- **`--bg-primary`** : C'est ta couleur pure, non modifiée.
- **`--bg-secondary`** : On injecte 20% de la "couleur de mélange" dans ta primaire pour créer un léger contraste (ex: pour la barre du bas).
- **`--bg-card`** : On injecte seulement 10% pour une distinction très subtile.
- **`--bg-dark`** : On force un mélange avec du noir pur (15%) pour les zones de forte profondeur.

#### Contraste Adaptatif

Le texte utilise aussi `color-mix` combiné au flag de luminosité :

```css
--text-primary: color-mix(in srgb, white, #1e293b calc(var(--bg-is-light) * 100%));
```

Si `--bg-is-light` est à 1, le texte devient sombre. S'il est à 0, il devient blanc. C'est totalement dynamique et automatique.

## Utilisation

### Via React (Composant `<StreamLayer />`)

```tsx
<StreamLayer
  theme={{
    primary: '#7375d1',   // Teinte principale de l'interface
    secondary: '#2dd4bf'  // Couleur des accents interactifs
  }}
/>
```

### Via la balise `<script>` (Widget Web)

```html
<script 
  src="..." 
  data-theme-primary="#7375d1" 
  data-theme-secondary="#2dd4bf">
</script>
```

## Pourquoi cette approche ?

- **Fidélité au Design** : Ta couleur `primary` n'est pas "salie" par du gris générique, elle reste la base de tout l'univers visuel.
- **Performance** : Aucun calcul JavaScript complexe pendant le rendu, tout est géré nativement par le moteur CSS du navigateur.
- **Robustesse** : Le passage d'un thème clair à sombre se fait sans changer une seule ligne de code CSS, juste en changeant la valeur de la variable `primary`.
