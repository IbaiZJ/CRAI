# Configuración de GitHub Actions para Tests de AI/Backend

## Workflow: `ai-backend-tests.yml`

Este workflow ejecuta automáticamente los tests de pytest para el backend (carpeta `ai/`) cada vez que:
- Se hace push a las ramas `main` o `ai`
- Se crea un Pull Request hacia las ramas `main` o `ai`
- Solo si hay cambios en la carpeta `ai/` o en el propio workflow

## 🔄 Jobs

### 1. **Test** (Matriz de Python)
Ejecuta los tests en múltiples versiones de Python para asegurar compatibilidad:
- Python 3.11
- Python 3.12
- Python 3.13

**Pasos:**
1. ✅ Checkout del código
2. 🐍 Configurar Python con caché de pip
3. 📦 Instalar dependencias desde `requirements.txt`
4. 🧪 Ejecutar tests con pytest y generar reporte de cobertura
5. 📊 Subir reporte de cobertura como artefacto (solo Python 3.13)

### 2. **Coverage Check**
Verifica que la cobertura de código sea al menos del 80%.

**Pasos:**
1. ✅ Checkout del código
2. 🐍 Configurar Python 3.13
3. 📦 Instalar dependencias
4. 📊 Ejecutar pytest con `--cov-fail-under=80`

## 📊 Visualización de Resultados

### En GitHub
- Ve a la pestaña **Actions** en tu repositorio
- Selecciona el workflow "AI Backend Tests"
- Verás el estado de cada job y versión de Python

### Badges (opcional)
Puedes agregar un badge al README:

```markdown
![AI Tests](https://github.com/IbaiZJ/CRAI/actions/workflows/ai-backend-tests.yml/badge.svg)
```

## 🚀 Optimizaciones

1. **Cache de pip**: Las dependencias se cachean para acelerar builds
2. **Matriz de Python**: Tests paralelos en 3 versiones
3. **Paths filter**: Solo ejecuta cuando hay cambios en `ai/`
4. **fail-fast: false**: Continúa tests aunque una versión falle

## 📁 Artefactos

El workflow guarda:
- `coverage.xml` - Reporte de cobertura en formato XML
- Retención: 30 días

Para descargar:
1. Ve a la ejecución del workflow
2. Scroll hasta "Artifacts"
3. Descarga `coverage-report`

## 🔧 Comandos Locales Equivalentes

```bash
# Ejecutar lo mismo que el workflow
cd ai
pip install -r requirements.txt
pytest -v --cov=api --cov-report=xml --cov-report=term-missing
pytest --cov=api --cov-fail-under=80
```

## 🛠️ Configuración Adicional

### Agregar Codecov (opcional)
Si quieres visualizar la cobertura en Codecov:

1. Crea una cuenta en [codecov.io](https://codecov.io)
2. Agrega el token a GitHub Secrets: `CODECOV_TOKEN`
3. Agrega este step después de "Run Tests":

```yaml
- name: Upload to Codecov
  uses: codecov/codecov-action@v4
  with:
    file: ./ai/coverage.xml
    flags: backend
    token: ${{ secrets.CODECOV_TOKEN }}
```

### Agregar SonarCloud
Para análisis de código con SonarCloud, agrega estos secrets:
- `SONAR_TOKEN`
- `SONAR_PROJECT_KEY`
- `SONAR_ORGANIZATION`

Y modifica el workflow existente `sonarCloud.yml` para incluir Python.

## 🐛 Troubleshooting

### El workflow no se ejecuta
- ✅ Verifica que los cambios estén en la carpeta `ai/`
- ✅ Verifica que la rama sea `main` o `ai`
- ✅ Verifica que el archivo workflow esté en `.github/workflows/`

### Tests fallan en CI pero pasan localmente
- 🔍 Verifica la versión de Python (puede ser diferente)
- 🔍 Verifica variables de entorno
- 🔍 Verifica rutas relativas vs absolutas

### Error: "ModuleNotFoundError"
- 📦 Agrega el módulo faltante a `requirements.txt`
- 🔄 Haz commit y push de nuevo

## 📝 Próximos pasos

1. **Linting** (opcional):
   ```bash
   pip install black flake8 isort mypy
   black api/ tests/
   flake8 api/ tests/
   isort api/ tests/
   ```

2. **Pre-commit hooks**:
   - Ejecuta tests antes de cada commit
   - Ver `.pre-commit-config.yaml` (crear si no existe)

3. **Deploy automático**:
   - Agregar job de deploy después de tests exitosos
   - Usar Docker para construir imagen y push a registry

## 🔗 Referencias

- [GitHub Actions - Python](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-python)
- [pytest Documentation](https://docs.pytest.org/)
- [GitHub Actions - Workflows](https://docs.github.com/en/actions/using-workflows)
