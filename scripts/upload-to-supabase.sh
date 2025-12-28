#!/bin/bash

# Upload January 2026 releases to Supabase "releaseready" bucket
# Run from project root: ./scripts/upload-to-supabase.sh

SUPABASE_URL="https://pznmptudgicrmljjafex.supabase.co"
BUCKET="releaseready"
AUDIO_DIR="365-releases/audio/january"
COVERS_DIR="365-releases/covers/january"

# You need to set this - get it from Supabase Dashboard > Settings > API > service_role key
# DO NOT commit this key to git!
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "ERROR: SUPABASE_SERVICE_KEY not set"
    echo "Export it first: export SUPABASE_SERVICE_KEY='your-service-role-key'"
    exit 1
fi

echo "=== Uploading January 2026 Releases to Supabase ==="
echo "Bucket: $BUCKET"
echo ""

# Upload audio files
echo "--- Uploading Audio Files ---"
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
    
    echo "Uploading: $filename"
    curl -s -X POST \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/audio/january/${encoded}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: ${content_type}" \
        -H "x-upsert: true" \
        --data-binary "@$file" \
        -o /dev/null -w "  Status: %{http_code}\n"
done

# Upload cover images (if they exist)
if [ -d "$COVERS_DIR" ]; then
    echo ""
    echo "--- Uploading Cover Images ---"
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
        
        echo "Uploading: $filename"
        curl -s -X POST \
            "${SUPABASE_URL}/storage/v1/object/${BUCKET}/covers/january/${encoded}" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
            -H "Content-Type: ${content_type}" \
            -H "x-upsert: true" \
            --data-binary "@$file" \
            -o /dev/null -w "  Status: %{http_code}\n"
    done
fi

echo ""
echo "=== Upload Complete ==="
echo "Files should now be accessible at:"
echo "${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/audio/january/{filename}"
echo "${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/covers/january/{filename}"
