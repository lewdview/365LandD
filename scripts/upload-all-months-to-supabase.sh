#!/bin/bash

# Upload all 12 months of 2026 releases to Supabase "releaseready" bucket
# Run from project root: ./scripts/upload-all-months-to-supabase.sh

SUPABASE_URL="https://pznmptudgicrmljjafex.supabase.co"
BUCKET="releaseready"
BASE_DIR="365-releases"

# You need to set this - get it from Supabase Dashboard > Settings > API > service_role key
# DO NOT commit this key to git!
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "ERROR: SUPABASE_SERVICE_KEY not set"
    echo "Export it first: export SUPABASE_SERVICE_KEY='your-service-role-key'"
    exit 1
fi

MONTHS=("january" "february" "march" "april" "may" "june" "july" "august" "september" "october" "november" "december")

echo "=== Uploading All 12 Months of 2026 Releases to Supabase ==="
echo "Bucket: $BUCKET"
echo ""

total_uploaded=0
total_failed=0

for month in "${MONTHS[@]}"; do
    AUDIO_DIR="${BASE_DIR}/audio/${month}"
    COVERS_DIR="${BASE_DIR}/covers/${month}"
    
    echo "--- Processing $month ---"
    
    # Upload audio files
    if [ -d "$AUDIO_DIR" ]; then
        for file in "$AUDIO_DIR"/*.{wav,mp3}; do
            [ -f "$file" ] || continue
            filename=$(basename "$file")
            encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$filename")
            
            # Determine content type
            if [[ "$filename" == *.mp3 ]]; then
                content_type="audio/mpeg"
            else
                content_type="audio/wav"
            fi
            
            echo "  Uploading audio: $filename"
            response=$(curl -s -w "\n%{http_code}" -X POST \
                "${SUPABASE_URL}/storage/v1/object/${BUCKET}/audio/${month}/${encoded}" \
                -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
                -H "Content-Type: ${content_type}" \
                -H "x-upsert: true" \
                --data-binary "@$file")
            
            status_code=$(echo "$response" | tail -n1)
            if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
                echo "    ✓ Status: $status_code"
                ((total_uploaded++))
            else
                echo "    ✗ Status: $status_code (FAILED)"
                ((total_failed++))
            fi
        done
    else
        echo "  Audio directory not found: $AUDIO_DIR"
    fi
    
    # Upload cover images
    if [ -d "$COVERS_DIR" ]; then
        for file in "$COVERS_DIR"/*.{jpg,png}; do
            [ -f "$file" ] || continue
            filename=$(basename "$file")
            encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$filename")
            
            # Determine content type
            if [[ "$filename" == *.png ]]; then
                content_type="image/png"
            else
                content_type="image/jpeg"
            fi
            
            echo "  Uploading cover: $filename"
            response=$(curl -s -w "\n%{http_code}" -X POST \
                "${SUPABASE_URL}/storage/v1/object/${BUCKET}/covers/${month}/${encoded}" \
                -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
                -H "Content-Type: ${content_type}" \
                -H "x-upsert: true" \
                --data-binary "@$file")
            
            status_code=$(echo "$response" | tail -n1)
            if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
                echo "    ✓ Status: $status_code"
                ((total_uploaded++))
            else
                echo "    ✗ Status: $status_code (FAILED)"
                ((total_failed++))
            fi
        done
    else
        echo "  Cover directory not found: $COVERS_DIR"
    fi
    
    echo ""
done

echo "=== Upload Summary ==="
echo "Total Uploaded: $total_uploaded"
echo "Total Failed: $total_failed"
echo ""
echo "Files are accessible at:"
echo "${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/audio/{month}/{filename}"
echo "${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/covers/{month}/{filename}"
