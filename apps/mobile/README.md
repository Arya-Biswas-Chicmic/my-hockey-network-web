# 🚀 Expo Boilerplate

A production-ready Expo boilerplate built with best practices for scalable React Native development. This setup includes:

- 🧭 React Navigation
- 🧠 Redux Toolkit for state management
- 🌐 Localization with i18n
- 🎨 Theming with light/dark support
- 🧹 ESLint + Prettier for consistent code quality
- 🐶 Husky + Commitlint for Git commit standards
- 🖼️ Built-in support for SVGs, images, and custom fonts
- 🌱 .env file support with dev/prod app variants

---

## 🚀 Getting Started

### 1. Create a New Project from This Template

You can initialize a new Expo project using this boilerplate:

```bash
npx create-expo-app my-app --template https://github.com/harjot339/expo-boilerplate
```

### 2. Install Dependencies

```bash
yarn
```

### 3.Start the Development Server

```bash
yarn start
```

## 🌱 Environment Setup <code>(.env)</code>

#### This project uses environment variables to configure build-time options for different environments (e.g., development and production).

### 1. Copy .env.example and create your environment file:

```bash
cp .env.example .env
```

### 2. Define your variables:

```bash
APP_VARIANT=development
# Add more variables as needed
```

### 3. Access env variables in your code using:

```ts
process.env.APP_VARIANT;
```

## ⚙️ Dev/Prod Configuration via <code>app.config.ts</code>

#### This project uses dynamic configuration with app.config.ts, which switches between development and production setups based on the <code>APP_VARIANT</code> environment variable.

```ts
const IS_DEV = process.env.APP_VARIANT === 'development';

const BUNDLE_IDENTIFIER = IS_DEV
  ? 'com.anonymous.expoboilerplate.dev'
  : 'com.anonymous.expoboilerplate';

const config: ExpoConfig = {
  name: IS_DEV ? 'expo-boilerplate-dev' : 'expo-boilerplate',
  ...
  ios: {
    bundleIdentifier: BUNDLE_IDENTIFIER,
  },
  android: {
    package: BUNDLE_IDENTIFIER,
  },
  extra: {
    APP_VARIANT: process.env.APP_VARIANT,
  },
};
```

#### This allows you to:

- Use different app names and bundle identifiers for dev/prod
- Dynamically configure environment-specific settings
- Keep a clean and scalable config structure

## 📊 SonarQube Setup for Code Quality & Coverage

### 1. Install Docker

### 2. Install SonarScanner Globally

```bash
npm install -g sonar-scanner
```

#### Verify installation

```bash
sonar-scanner -h
```

### 3. Run SonarQube in Docker

```bash
docker-compose up
```

Access it at: http://localhost:9000

Default credentials: admin / admin (you’ll be prompted to change the password)

### 4. After sonarqube is running properly on http://localhost:9000 , create a project locally, and note down the creds!

### 5. To check the sonarqube coverage, you need to execute the below command with respect to the project created on step 4

```bash
sonar-scanner -Dsonar.projectKey=project-name -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000 -Dsonar.token=project-token
```

### Note: Update project-token with the token generated after step 4
