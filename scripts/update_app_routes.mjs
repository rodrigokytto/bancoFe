import fs from 'fs';

function updateApp(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('DrClimaSimulador')) {
    content = content.replace(
      'import { UltraVisionAi } from "./pages/UltraVisionAi";',
      'import { UltraVisionAi } from "./pages/UltraVisionAi";\nimport { DrClimaSimulador } from "./pages/DrClimaSimulador";'
    );

    content = content.replace(
      '<Route path="/ultra" component={UltraVisionAi} />',
      '<Route path="/ultra" component={UltraVisionAi} />\n            <Route path="/dr-clima" component={DrClimaSimulador} />\n            <Route path="/clima" component={DrClimaSimulador} />\n            <Route path="/simulador-clima" component={DrClimaSimulador} />'
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Rotas de Dr. Clima registradas em ${filePath}!`);
  } else {
    console.log(`ℹ️ DrClimaSimulador já registrado em ${filePath}.`);
  }
}

updateApp('/home/ubuntu/zuma-repo/client/src/App.tsx');
updateApp('/home/ubuntu/zumapilot/client/src/App.tsx');
