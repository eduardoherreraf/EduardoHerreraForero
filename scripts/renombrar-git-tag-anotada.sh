#!/bin/bash

# Script para renombrar etiquetas anotadas Git preservando sus valores
# Compatible con Windows 10 (Git Bash)
# Los valores se configuran directamente en el script

set -e  # Salir inmediatamente si algún comando falla

# =============================================================================
# CONFIGURACIÓN - MODIFICAR ESTOS VALORES SEGÚN NECESIDAD
# =============================================================================
readonly VIEJO="v3.0.0"
readonly NUEVO="v3.0.1"

# =============================================================================
# CONFIGURACIÓN ADICIONAL
# =============================================================================
readonly ELIMINAR_VIEJO_LOCAL=true        # true/false - eliminar etiqueta vieja local
readonly ELIMINAR_VIEJO_REMOTO=true       # true/false - eliminar etiqueta vieja del remoto
readonly SUBIR_NUEVO_REMOTO=true          # true/false - subir nueva etiqueta al remoto
readonly NOMBRE_REMOTO="origin"           # nombre del repositorio remoto

# Colores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Función para mostrar log con timestamp
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[$timestamp]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[$timestamp] ✓${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[$timestamp] ⚠${NC} $message" ;;
        "ERROR") echo -e "${RED}[$timestamp] ✗${NC} $message" ;;
    esac
}

# Función para verificar si estamos en un repositorio Git
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "No estás en un repositorio Git válido"
        exit 1
    fi
}

# Función para verificar si una etiqueta existe
tag_exists() {
    local tag_name="$1"
    git tag -l | grep -q "^${tag_name}$"
}

# Función para verificar si una etiqueta es anotada
is_annotated_tag() {
    local tag_name="$1"
    local tag_type=$(git cat-file -t "$tag_name" 2>/dev/null)
    [[ "$tag_type" == "tag" ]]
}

# Función para verificar conectividad con el remoto
check_remote_connectivity() {
    if git ls-remote --exit-code "$NOMBRE_REMOTO" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Función para mostrar información de configuración
show_config() {
    echo -e "${CYAN}=== CONFIGURACIÓN DEL SCRIPT ===${NC}"
    echo -e "Etiqueta antigua: ${YELLOW}$VIEJO${NC}"
    echo -e "Etiqueta nueva: ${YELLOW}$NUEVO${NC}"
    echo -e "Eliminar vieja (local): ${YELLOW}$ELIMINAR_VIEJO_LOCAL${NC}"
    echo -e "Eliminar vieja (remoto): ${YELLOW}$ELIMINAR_VIEJO_REMOTO${NC}"
    echo -e "Subir nueva (remoto): ${YELLOW}$SUBIR_NUEVO_REMOTO${NC}"
    echo -e "Repositorio remoto: ${YELLOW}$NOMBRE_REMOTO${NC}"
    echo ""
}

# Función para crear nueva etiqueta preservando valores
create_new_tag() {
    local old_tag="$1"
    local new_tag="$2"
    
    log "INFO" "Creando nueva etiqueta '$new_tag' con valores de '$old_tag'..."
    
    # Obtener el commit al que apunta la etiqueta vieja
    local commit_hash=$(git rev-list -n 1 "$old_tag")
    
    # Obtener el mensaje completo de la etiqueta vieja
    local tag_message=$(git tag -l --format='%(contents)' "$old_tag")
    
    # Crear la nueva etiqueta anotada con el mensaje preservado
    if git tag -a "$new_tag" "$commit_hash" -m "$tag_message"; then
        log "SUCCESS" "Nueva etiqueta '$new_tag' creada exitosamente"
        return 0
    else
        log "ERROR" "Falló la creación de la nueva etiqueta"
        return 1
    fi
}

# Función para eliminar etiqueta local
delete_local_tag() {
    local tag_name="$1"
    
    log "INFO" "Eliminando etiqueta local '$tag_name'..."
    
    if git tag -d "$tag_name"; then
        log "SUCCESS" "Etiqueta local '$tag_name' eliminada"
        return 0
    else
        log "ERROR" "No se pudo eliminar la etiqueta local '$tag_name'"
        return 1
    fi
}

# Función para subir etiqueta al remoto
push_tag_to_remote() {
    local tag_name="$1"
    
    log "INFO" "Subiendo etiqueta '$tag_name' al remoto '$NOMBRE_REMOTO'..."
    
    if git push "$NOMBRE_REMOTO" "$tag_name"; then
        log "SUCCESS" "Etiqueta '$tag_name' subida al remoto"
        return 0
    else
        log "ERROR" "No se pudo subir la etiqueta '$tag_name' al remoto"
        return 1
    fi
}

# Función para eliminar etiqueta del remoto
delete_remote_tag() {
    local tag_name="$1"
    
    log "INFO" "Eliminando etiqueta '$tag_name' del remoto '$NOMBRE_REMOTO'..."
    
    if git push "$NOMBRE_REMOTO" ":refs/tags/$tag_name"; then
        log "SUCCESS" "Etiqueta '$tag_name' eliminada del remoto"
        return 0
    else
        log "ERROR" "No se pudo eliminar la etiqueta '$tag_name' del remoto"
        return 1
    fi
}

# Función principal
main() {
    echo -e "${BLUE}=== SCRIPT PARA RENOMBRAR ETIQUETAS GIT ===${NC}"
    echo ""
    
    # Mostrar configuración
    show_config
    
    # Verificar que estamos en un repositorio Git
    log "INFO" "Verificando repositorio Git..."
    check_git_repo
    log "SUCCESS" "Repositorio Git válido"
    
    # Sincronizar etiquetas del remoto
    log "INFO" "Sincronizando etiquetas del repositorio remoto..."
    if git fetch --tags 2>/dev/null; then
        log "SUCCESS" "Etiquetas sincronizadas desde el remoto"
    else
        log "WARNING" "No se pudo sincronizar con el remoto (continuando con etiquetas locales)"
    fi
    
    # Verificar que la etiqueta antigua existe
    log "INFO" "Verificando existencia de etiqueta antigua '$VIEJO'..."
    if ! tag_exists "$VIEJO"; then
        log "ERROR" "La etiqueta '$VIEJO' no existe"
        echo "Etiquetas disponibles:"
        git tag -l | sed 's/^/  - /'
        exit 1
    fi
    log "SUCCESS" "Etiqueta '$VIEJO' encontrada"
    
    # Verificar que la etiqueta antigua es anotada
    log "INFO" "Verificando que '$VIEJO' es una etiqueta anotada..."
    if ! is_annotated_tag "$VIEJO"; then
        log "ERROR" "La etiqueta '$VIEJO' no es una etiqueta anotada"
        exit 1
    fi
    log "SUCCESS" "Etiqueta '$VIEJO' es anotada"
    
    # Verificar que la nueva etiqueta no existe
    log "INFO" "Verificando que '$NUEVO' no existe..."
    if tag_exists "$NUEVO"; then
        log "ERROR" "La etiqueta '$NUEVO' ya existe"
        exit 1
    fi
    log "SUCCESS" "Etiqueta '$NUEVO' disponible para crear"
    
    # Mostrar información de la etiqueta antigua
    echo ""
    log "INFO" "Información de la etiqueta '$VIEJO':"
    git show "$VIEJO" --format="  Commit: %H%n  Autor: %an <%ae>%n  Fecha: %ad%n  Mensaje: %B" --no-patch | head -10
    echo ""
    
    # Crear nueva etiqueta
    if ! create_new_tag "$VIEJO" "$NUEVO"; then
        exit 1
    fi
    
    # Subir nueva etiqueta al remoto si está configurado
    if [[ "$SUBIR_NUEVO_REMOTO" == true ]]; then
        if check_remote_connectivity; then
            push_tag_to_remote "$NUEVO"
        else
            log "WARNING" "No hay conectividad con el remoto '$NOMBRE_REMOTO'"
        fi
    fi
    
    # Eliminar etiqueta vieja local si está configurado
    if [[ "$ELIMINAR_VIEJO_LOCAL" == true ]]; then
        delete_local_tag "$VIEJO"
    fi
    
    # Eliminar etiqueta vieja del remoto si está configurado
    if [[ "$ELIMINAR_VIEJO_REMOTO" == true ]]; then
        if check_remote_connectivity; then
            delete_remote_tag "$VIEJO"
        else
            log "WARNING" "No hay conectividad con el remoto '$NOMBRE_REMOTO'"
        fi
    fi
    
    echo ""
    log "SUCCESS" "¡Proceso completado exitosamente!"
    echo ""
    log "INFO" "Resumen de cambios:"
    echo "  - Etiqueta '$VIEJO' → '$NUEVO'"
    echo "  - Mensaje y valores preservados"
    echo "  - Mismo commit objetivo"
    
    # Mostrar etiquetas actuales
    echo ""
    log "INFO" "Etiquetas actuales:"
    git tag -l | sort -V | sed 's/^/  - /'
}

# Ejecutar función principal
main "$@"