#!/usr/bin/env bash
# Creates 14 sub-tasks under SE-3502 via Jira REST API.
# Usage:
#   JIRA_EMAIL=you@example.com JIRA_TOKEN=your_api_token bash scripts/create_jira_subtasks.sh

set -euo pipefail

BASE_URL="https://solidevelectrosoft.atlassian.net"
PROJECT_KEY="SE"
PARENT_KEY="SE-3502"
SPRINT_NAME="SE Sprint 38"

if [[ -z "${JIRA_EMAIL:-}" || -z "${JIRA_TOKEN:-}" ]]; then
  echo "Error: set JIRA_EMAIL and JIRA_TOKEN environment variables before running."
  echo "  export JIRA_EMAIL=you@atlassian.com"
  echo "  export JIRA_TOKEN=<your-api-token>   # https://id.atlassian.com/manage-profile/security/api-tokens"
  exit 1
fi

AUTH=$(echo -n "$JIRA_EMAIL:$JIRA_TOKEN" | base64)

create_subtask() {
  local summary="$1"
  local description="$2"
  local priority="${3:-Medium}"

  local payload
  payload=$(cat <<EOF
{
  "fields": {
    "project":     { "key": "$PROJECT_KEY" },
    "parent":      { "key": "$PARENT_KEY" },
    "summary":     "$summary",
    "description": {
      "type":    "doc",
      "version": 1,
      "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "$description" }] }]
    },
    "issuetype": { "name": "Subtask" },
    "priority":  { "name": "$priority" }
  }
}
EOF
)

  local result
  result=$(curl -s -X POST \
    -H "Authorization: Basic $AUTH" \
    -H "Content-Type: application/json" \
    --data "$payload" \
    "$BASE_URL/rest/api/3/issue")

  local key
  key=$(echo "$result" | grep -o '"key":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [[ -n "$key" ]]; then
    echo "  ✓ Created $key — $summary"
  else
    echo "  ✗ Failed: $summary"
    echo "    Response: $result"
  fi
}

echo "Creating 14 sub-tasks under $PARENT_KEY (Solidev Books - Web)..."
echo ""

# P0 Critical
create_subtask \
  "[ISSUE-01] Fix archive dialog — title and button show Delete instead of Archive" \
  "LifecycleArchiveDialog showed Delete Item/title even though the action is always archival. Fixed titleText, button label (always Archive), body text, and button color (always warning orange)." \
  "Critical"

create_subtask \
  "[ISSUE-02] Block negative stock at backend and frontend" \
  "Backend reduce_stock and adjust_stock now check current stock before allowing a decrement. Frontend inline stock dialog shows stockDialogError before hitting the API." \
  "Critical"

create_subtask \
  "[ISSUE-03] Add stock history section to AddEditProduct form" \
  "Collapsible Stock History table added to AddEditProduct (edit mode only). Fetches GET /api/stock/ledger/{id}, shows newest-first: Date, Type chip, Qty, Balance, Reason/Source." \
  "Critical"

# P1 High
create_subtask \
  "[ISSUE-05] Hide inventory section for Service items" \
  "Inventory Box in AddEditProduct is now wrapped with {form.item_type !== 'service' && ...}. Switching to Service clears reorder fields and collapses the section." \
  "High"

create_subtask \
  "[ISSUE-04] Surface duplicate item name error inline under Name field" \
  "handleSubmit catch block now detects /already exists/i in the API error message and routes it to errors.name instead of the page banner." \
  "High"

create_subtask \
  "[ISSUE-06] Add Opening Stock and Opening Stock Rate fields" \
  "Two new fields (opening_stock, opening_stock_rate) added to AddEditProduct, visible only on create. After product is saved, adjustStock() is called to record the opening IN transaction." \
  "High"

create_subtask \
  "[ISSUE-07] Add SKU / Item Code field" \
  "sku field added to initialForm, AddEditProduct form UI (after HSN Code), and both create_product and update_product in the backend product_api.py." \
  "High"

create_subtask \
  "[ISSUE-08] Add Reason field to quick stock adjustment dialog" \
  "stockReason state and a Reason TextField added to ProductList inline stock dialog. Passed as reason to updateProductStock() and stored by add_stock/reduce_stock backend endpoints." \
  "High"

# P2 Medium
create_subtask \
  "[ISSUE-11] Create Item detail page at /products/:id" \
  "New page src/pages/ProductDetail.jsx added. Shows stat cards (selling/cost price, stock, reorder level), item details grid, stock history table, and price history from audit logs. Product names in list are now clickable." \
  "Medium"

create_subtask \
  "[ISSUE-12] Price history from audit logs on Item detail page" \
  "ProductDetail.jsx fetches GET /api/audit-logs?entity_type=product&entity_id={id}, filters UPDATE events where price or purchase_rate changed, and renders a price history table." \
  "Medium"

create_subtask \
  "[ISSUE-09] Category filter fix in Product list" \
  "Verified category filter Select uses correct MUI onChange pattern. Categories computed from live product data with All Categories default. No functional change needed." \
  "Medium"

create_subtask \
  "[ISSUE-10] Archived filter fix in Product list" \
  "Verified matchesView logic correctly handles Archived bucket via isArchivedProduct(). Filter correctly excludes archived items from All view." \
  "Medium"

create_subtask \
  "[ISSUE-14] Add Low Stock Alert Threshold field separate from Reorder Level" \
  "low_stock_threshold field added to initialForm, inventory section of AddEditProduct (new field before Reorder Level), and both create/update product backend endpoints." \
  "Medium"

# P3 Low
create_subtask \
  "[ISSUE-13] Inventory valuation method stub in Settings" \
  "New page src/pages/InventorySettings.jsx at /settings/inventory. Dropdown with FIFO/LIFO/Weighted Average options. Clearly marked Coming Soon — no backend changes, UI only." \
  "Low"

echo ""
echo "Done. Visit https://solidevelectrosoft.atlassian.net/browse/$PARENT_KEY to see sub-tasks."
