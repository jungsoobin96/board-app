#!/usr/bin/env bash
# scripts/check-comment-coverage.sh
#
# R-N-05 / F-10 한국어 주석 커버리지 측정 (정적 분석, grep 룰 기반)
#
# 측정 대상 (11-coding-conventions §4 정합):
#   - backend/src/controllers/*.ts
#   - backend/src/services/*.ts
#   - backend/src/repositories/*.ts
#   - frontend/src/components/**/*.tsx
#
# 측정 단위 (plan §5 O-23-1 결정):
#   - exported 함수·컴포넌트 헤더 바로 위 라인 (JSDoc 블록의 마지막 라인 또는 단일 //)
#   - 함수 본문 내 주석은 측정 대상 외
#
# 한국어 판정 (risk §F-RISK-01 완화):
#   - 연속 한국어 글자 2자 이상 ([가-힣]{2,})
#   - 단일 한글 1자(예: "Article의"의 "의")는 false positive 회피로 미카운트
#
# 임계 (R-N-05 정본):
#   - 4 layer 각각 ≥ 80%
#   - 1 layer라도 미달 시 exit 1
#
# 사용:
#   bash scripts/check-comment-coverage.sh
#
# 출력:
#   layer별 [총 함수 / 한국어 주석 함수 / 비율 %] + 누락 함수 목록(파일:라인) + 종합 PASS/FAIL
#
# 외부 의존:
#   POSIX bash + grep만 사용 (yq·gh·jq·node 등 불필요)

set -euo pipefail

# ─────────────────────────────────────────────────────────────
# 설정
# ─────────────────────────────────────────────────────────────

readonly THRESHOLD=80  # R-N-05 정본 임계 %
readonly REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 4 layer 정의 (F-10 정본)
readonly -a LAYERS=(
  "backend/src/controllers"
  "backend/src/services"
  "backend/src/repositories"
  "frontend/src/components"
)

# 함수/컴포넌트 시그니처 패턴 (O-23-2 결정)
#   - export function / export async function
#   - export default function
#   - export const NAME = ...  (arrow function 또는 wrapper 함수)
#   - export const NAME: Type = ...  (타입 어노테이션 포함, 예: RequestHandler · FC · JSX.Element)
# interface · type · class · 단순 객체 export는 제외
# (단순 상수 const는 4 layer에서 거의 없어 false positive 무시)
readonly FUNCTION_PATTERN='^export[[:space:]]+((async[[:space:]]+)?function|default[[:space:]]+(async[[:space:]]+)?function|const[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*(:[^=]*)?=)'

# 한국어 판정 패턴 (F-RISK-01 완화 — 연속 2자 이상)
readonly KOREAN_PATTERN='[가-힣][가-힣]+'

# ─────────────────────────────────────────────────────────────
# 함수 정의
# ─────────────────────────────────────────────────────────────

# layer별 측정 — 인자: layer 경로
# 출력: "<총 함수> <한국어 주석 함수> <누락 목록>"
measure_layer() {
  local layer="$1"
  local layer_abs="${REPO_ROOT}/${layer}"

  if [ ! -d "$layer_abs" ]; then
    echo "0 0"
    return
  fi

  # 측정 대상 파일 (.ts / .tsx, 테스트 파일 제외)
  local files
  files=$(find "$layer_abs" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -name "*.test.ts" ! -name "*.test.tsx" \
    ! -name "*.spec.ts" ! -name "*.spec.tsx" 2>/dev/null || true)

  if [ -z "$files" ]; then
    echo "0 0"
    return
  fi

  local total=0
  local with_korean=0
  local missing_list=""

  while IFS= read -r file; do
    [ -z "$file" ] && continue

    # 파일 내 exported 함수 라인 번호 수집
    local fn_lines
    fn_lines=$(grep -nE "$FUNCTION_PATTERN" "$file" 2>/dev/null | cut -d: -f1 || true)

    [ -z "$fn_lines" ] && continue

    while IFS= read -r fn_line; do
      [ -z "$fn_line" ] && continue
      total=$((total + 1))

      # 함수 헤더 바로 위 라인부터 거꾸로 올라가며 JSDoc 블록 끝(*/) 찾기
      # 최대 10라인 뒤로 탐색 (긴 JSDoc 허용)
      local has_korean=0
      local lookback_start=$((fn_line - 1))
      local lookback_end=$((fn_line - 10))
      [ "$lookback_end" -lt 1 ] && lookback_end=1

      # 헤더 바로 위 라인이 */ 또는 // 인 경우만 JSDoc/한줄 주석으로 인정
      local prev_line_num=$((fn_line - 1))
      [ "$prev_line_num" -lt 1 ] && {
        missing_list="${missing_list}${file#${REPO_ROOT}/}:${fn_line}"$'\n'
        continue
      }

      local prev_line
      prev_line=$(sed -n "${prev_line_num}p" "$file" 2>/dev/null || true)

      # JSDoc 블록 끝(*/) — 블록 시작(/**)까지 거슬러 올라가며 한국어 검사
      if echo "$prev_line" | grep -qE '\*/[[:space:]]*$'; then
        # JSDoc 블록 라인 범위 탐색
        local jsdoc_start=$prev_line_num
        while [ "$jsdoc_start" -gt 1 ]; do
          local check_line
          check_line=$(sed -n "${jsdoc_start}p" "$file" 2>/dev/null || true)
          if echo "$check_line" | grep -qE '^[[:space:]]*/\*\*'; then
            break
          fi
          jsdoc_start=$((jsdoc_start - 1))
        done
        # JSDoc 블록 본문에서 한국어 검사
        if sed -n "${jsdoc_start},${prev_line_num}p" "$file" | grep -qE "$KOREAN_PATTERN"; then
          has_korean=1
        fi
      fi

      if [ "$has_korean" -eq 1 ]; then
        with_korean=$((with_korean + 1))
      else
        missing_list="${missing_list}${file#${REPO_ROOT}/}:${fn_line}"$'\n'
      fi
    done <<< "$fn_lines"
  done <<< "$files"

  # stdout 라인 1: "total with_korean"
  # stdout 라인 2+: missing list (있으면)
  echo "$total $with_korean"
  if [ -n "$missing_list" ]; then
    printf '%s' "$missing_list"
  fi
}

# 비율 계산 (정수 산술, 소수점 반올림 X)
# 인자: 분자 분모
calc_percent() {
  local num="$1"
  local den="$2"
  if [ "$den" -eq 0 ]; then
    echo "100"  # 함수 0건이면 100% (vacuous truth)
    return
  fi
  echo $(( (num * 100) / den ))
}

# ─────────────────────────────────────────────────────────────
# 메인
# ─────────────────────────────────────────────────────────────

main() {
  echo "==================================================================="
  echo " 한국어 주석 커버리지 측정 (R-N-05 / F-10)"
  echo " 임계: ≥ ${THRESHOLD}% / 4 layer"
  echo " 측정 단위: exported 함수 헤더 위 JSDoc 한국어 (연속 2자 이상)"
  echo "==================================================================="
  echo ""

  local overall_pass=1
  local layer_results=""

  for layer in "${LAYERS[@]}"; do
    local result
    result=$(measure_layer "$layer")

    # 첫 라인 = "total with_korean", 나머지 = missing list
    local stats
    stats=$(echo "$result" | head -1)
    local missing
    missing=$(echo "$result" | tail -n +2)

    local total
    total=$(echo "$stats" | awk '{print $1}')
    local with_korean
    with_korean=$(echo "$stats" | awk '{print $2}')

    local percent
    percent=$(calc_percent "$with_korean" "$total")

    local verdict
    if [ "$percent" -ge "$THRESHOLD" ]; then
      verdict="✅ PASS"
    else
      verdict="❌ FAIL"
      overall_pass=0
    fi

    printf "  %-40s %3d / %-3d  (%3d%%)  %s\n" "$layer" "$with_korean" "$total" "$percent" "$verdict"

    # 누락 함수 목록 (FAIL인 경우만 노출)
    if [ "$percent" -lt "$THRESHOLD" ] && [ -n "$missing" ]; then
      layer_results="${layer_results}"$'\n'"  [$layer 누락 함수]"$'\n'
      while IFS= read -r line; do
        [ -z "$line" ] && continue
        layer_results="${layer_results}    - ${line}"$'\n'
      done <<< "$missing"
    fi
  done

  echo ""
  if [ -n "$layer_results" ]; then
    echo "==================================================================="
    echo " 누락 함수 상세"
    echo "==================================================================="
    printf '%s' "$layer_results"
    echo ""
  fi

  echo "==================================================================="
  if [ "$overall_pass" -eq 1 ]; then
    echo " 종합: ✅ PASS — 4 layer 모두 ≥ ${THRESHOLD}% 충족"
    echo "==================================================================="
    exit 0
  else
    echo " 종합: ❌ FAIL — 1개 이상 layer가 ${THRESHOLD}% 미달"
    echo " 보강: 누락 함수에 JSDoc /** 한국어 의도 */ 추가 후 재실행"
    echo "==================================================================="
    exit 1
  fi
}

main "$@"
