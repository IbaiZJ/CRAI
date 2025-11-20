# 🔍 SonarCloud con Python - Guía de Integración

## ¿Qué hace SonarCloud con los tests de Python?

SonarCloud **NO ejecuta los tests**, pero **SÍ analiza**:

### ✅ Lo que SonarCloud HACE:
1. **Analiza el código** de tests y aplicación
2. **Importa reportes de cobertura** generados por pytest
3. **Detecta code smells** en los tests
4. **Encuentra bugs potenciales** en el código de tests
5. **Mide complejidad ciclomática**
6. **Detecta código duplicado**
7. **Verifica estándares de código**

### ❌ Lo que SonarCloud NO HACE:
- No ejecuta pytest (lo hace GitHub Actions)
- No genera reportes de cobertura (lo hace pytest)
- No corre el código Python

## 🔄 Flujo de Trabajo

```
GitHub Actions Workflow:
  1. Checkout código
  2. Instalar Python
  3. Instalar dependencias
  4. Ejecutar pytest --cov=api --cov-report=xml  ← Genera coverage.xml
  5. SonarCloud lee coverage.xml                 ← Importa cobertura
  6. SonarCloud analiza código Python            ← Análisis estático
  7. SonarCloud sube resultados a la nube        ← Dashboard
```

## 📁 Archivos Configurados

### 1. `sonar-project.properties`
```properties
sonar.projectKey=${SONAR_PROJECT_KEY}
sonar.organization=${SONAR_ORGANIZATION}

# Código fuente
sonar.sources=ai/api
sonar.tests=ai/tests

# Reporte de cobertura de pytest
sonar.python.coverage.reportPaths=ai/coverage.xml

# Exclusiones
sonar.exclusions=**/__pycache__/**,**/htmlcov/**
```

### 2. `.github/workflows/sonarCloud.yml`
Ejecuta:
1. Tests de Python con pytest
2. Genera `coverage.xml`
3. SonarCloud analiza el código y la cobertura

## 🎯 Métricas que Verás en SonarCloud

### Dashboard Principal
- **Bugs**: Errores potenciales en el código
- **Vulnerabilities**: Problemas de seguridad
- **Code Smells**: Código que debería mejorarse
- **Coverage**: % de código cubierto por tests
- **Duplications**: Código duplicado
- **Security Hotspots**: Puntos de revisión de seguridad

### Para Python Específicamente
- Complejidad de funciones
- Código no usado
- Variables no usadas
- Imports no usados
- Problemas de estilo (PEP 8)
- Funciones muy largas
- Demasiados parámetros

## 🚀 Cómo Usar

### Primera Vez - Configurar SonarCloud

1. **Crear cuenta en SonarCloud**:
   - Ve a [sonarcloud.io](https://sonarcloud.io)
   - Login con GitHub
   - Importa tu repositorio `IbaiZJ/CRAI`

2. **Obtener credenciales**:
   - Organization: Tu organización en SonarCloud
   - Project Key: Clave del proyecto (auto-generada)
   - Token: Settings → Security → Generate Token

3. **Agregar secrets en GitHub**:
   ```
   Settings → Secrets and variables → Actions → New repository secret
   
   SONAR_TOKEN          → Token de SonarCloud
   SONAR_PROJECT_KEY    → Clave del proyecto
   SONAR_ORGANIZATION   → Tu organización
   ```

4. **Push y esperar**:
   ```bash
   git add .
   git commit -m "feat: add SonarCloud integration for Python"
   git push
   ```

### Ver Resultados

1. **En SonarCloud**:
   - Ve a [sonarcloud.io](https://sonarcloud.io)
   - Selecciona tu proyecto
   - Verás el dashboard con métricas

2. **En GitHub**:
   - PR checks mostrarán estado de SonarCloud
   - Comentarios automáticos en PRs con problemas

## 📊 Ejemplo de Reporte

### Cobertura
```
Overall Coverage: 100%
- api/main.py: 100% (5/5 lines)
- api/routers/router.py: 100% (6/6 lines)
- api/core/config.py: 100% (7/7 lines)
```

### Code Smells
```
⚠️ Function 'process_image' has 15 parameters (max: 7)
⚠️ Function 'detect_plate' is too complex (complexity: 12)
ℹ️ Variable 'temp_result' is never used
```

### Bugs
```
🐛 Possible NullPointerException in line 45
🐛 Resource not closed properly in line 78
```

## 🔧 Comandos Locales

### Ejecutar análisis local (requiere sonar-scanner)

```bash
# Instalar sonar-scanner
# Windows: choco install sonarscanner
# Mac: brew install sonar-scanner
# Linux: descargar de sonarcloud.io

# Ejecutar tests y generar cobertura
cd ai
pytest --cov=api --cov-report=xml

# Ejecutar análisis
cd ..
sonar-scanner \
  -Dsonar.projectKey=tu_project_key \
  -Dsonar.organization=tu_organization \
  -Dsonar.sources=ai/api \
  -Dsonar.tests=ai/tests \
  -Dsonar.python.coverage.reportPaths=ai/coverage.xml \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=tu_token
```

## 📈 Quality Gate

SonarCloud puede bloquear PRs si no cumplen los estándares:

### Configuración Recomendada
```yaml
Quality Gate Conditions:
- Coverage on New Code > 80%
- Duplicated Lines < 3%
- Maintainability Rating = A
- Reliability Rating = A
- Security Rating = A
```

### En GitHub Branch Protection
```
Settings → Branches → main → Add rule:
☑️ Require status checks to pass before merging
  ☑️ SonarCloud Code Analysis
```

## 🎨 Badge para README

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tu_project_key&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=tu_project_key)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tu_project_key&metric=coverage)](https://sonarcloud.io/summary/new_code?id=tu_project_key)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=tu_project_key&metric=bugs)](https://sonarcloud.io/summary/new_code?id=tu_project_key)
```

## 🔍 Análisis de Tests

SonarCloud también analiza **la calidad de los tests**:

### Test Smells Detectados
- Tests sin assertions
- Tests muy largos
- Tests con lógica compleja
- Tests duplicados
- Tests que no siguen naming conventions

### Ejemplo
```python
# ❌ Mal - SonarCloud lo detectará
def test_something():
    result = function()
    # Sin assertion!

# ✅ Bien
def test_something():
    result = function()
    assert result == expected
```

## 🛠️ Troubleshooting

### "Coverage report not found"
```bash
# Asegúrate de que el path sea correcto
sonar.python.coverage.reportPaths=ai/coverage.xml

# Verifica que coverage.xml existe después de pytest
ls ai/coverage.xml
```

### "No Python code detected"
```bash
# Verifica sonar.sources
sonar.sources=ai/api  # Debe apuntar a tu código

# Verifica que hay archivos .py
ls ai/api/*.py
```

### "Token authentication error"
```bash
# Verifica que el secret está configurado en GitHub
# Genera un nuevo token en SonarCloud si es necesario
```

## 📚 Recursos

- [SonarCloud Docs](https://docs.sonarcloud.io/)
- [Python Analysis](https://docs.sonarcloud.io/advanced-setup/languages/python/)
- [Coverage Import](https://docs.sonarcloud.io/enriching/test-coverage/python/)

## 🎯 Resultado Esperado

Después de configurar:
- ✅ Dashboard en SonarCloud con métricas
- ✅ Análisis automático en cada push/PR
- ✅ Comentarios automáticos en PRs
- ✅ Badges en README mostrando calidad
- ✅ Quality Gate bloqueando código malo
- ✅ Histórico de calidad del código

---

**Resumen**: SonarCloud **no ejecuta los tests**, pero **analiza el código** (incluyendo tests) y **lee los reportes de cobertura** generados por pytest. Es una herramienta de **análisis estático** complementaria a tus tests.
