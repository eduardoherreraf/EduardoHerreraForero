#!/bin/bash
# Script moderno para renombrar un tag en Git (local y remoto)
# Hecho por Eduardo Herrera Forero
# Contacto: eduardoetb@gmail.com

set -euo pipefail  # Modo estricto: salir en errores, variables no definidas, y errores en pipes

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 <viejo-nombre> <nuevo-nombre>"
    echo ""
    echo "Renombra un tag de Git tanto localmente como en el remoto."
    echo ""
    echo "Opciones:"
    echo "  -h, --help    Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 v1.0.0 v1.0.1"
    echo "  $0 old-tag new-tag"
}

# Verificar argumentos de ayuda
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    show_help
    exit 0
fi

# Verificar que se pasen exactamente 2 parámetros
# if [[ $# -ne 2 ]]; then
#     echo "Error: Se requieren exactamente 2 argumentos." >&2
#     echo "" >&2
#     show_help
#     exit 1
# fi

readonly VIEJO="v2.0.3"
readonly NUEVO="v2.0.4"

# Verificar que estamos en un repositorio Git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Error: No estás en un repositorio Git." >&2
    exit 1
fi

# Verificar que el tag viejo existe
if ! git rev-parse --verify "refs/tags/$VIEJO" >/dev/null 2>&1; then
    echo "Error: El tag '$VIEJO' no existe." >&2
    exit 1
fi

# Verificar que el tag nuevo no existe ya
if git rev-parse --verify "refs/tags/$NUEVO" >/dev/null 2>&1; then
    echo "Error: El tag '$NUEVO' ya existe." >&2
    exit 1
fi

# Obtener el commit del tag viejo
COMMIT=$(git rev-parse "$VIEJO")

echo "Renombrando tag '$VIEJO' como '$NUEVO'..."
echo "Commit: $COMMIT"

# Crear la nueva etiqueta apuntando al mismo commit que la vieja
if ! git tag "$NUEVO" "$COMMIT"; then
    echo "Error: No se pudo crear el tag '$NUEVO'." >&2
    exit 1
fi

# Eliminar la etiqueta vieja localmente
if ! git tag -d "$VIEJO"; then
    echo "Error: No se pudo eliminar el tag local '$VIEJO'." >&2
    # Limpiar: eliminar el tag nuevo que acabamos de crear
    git tag -d "$NUEVO" 2>/dev/null || true
    exit 1
fi

echo "Tags locales renombrados exitosamente."

# Verificar si hay un remoto configurado
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Advertencia: No hay remoto 'origin' configurado. Solo se renombró localmente."
    exit 0
fi

echo "Actualizando remoto 'origin'..."

# Eliminar la etiqueta vieja en el remoto (sintaxis moderna)
if ! git push origin --delete "$VIEJO" 2>/dev/null; then
    echo "Advertencia: No se pudo eliminar el tag '$VIEJO' del remoto (puede que no exista)."
fi

# Subir la etiqueta nueva al remoto
if ! git push origin "$NUEVO"; then
    echo "Error: No se pudo subir el tag '$NUEVO' al remoto." >&2
    exit 1
fi

echo "✓ Tag '$VIEJO' renombrado exitosamente como '$NUEVO' en local y remoto."

# Mostrar etiquetas locales actuales (opcional, solo las más recientes)
echo ""
echo "Tags locales recientes:"
git tag -l --sort=-version:refname | head -10