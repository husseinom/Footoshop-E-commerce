#!/bin/bash

# Update all JavaScript files to use dynamic API URL
cd /media/omarh11/OS/Users/Omarh/E-CommerceWeb/Footoshop-E-commerce

# Update each JavaScript file
for file in frontend/js/*.js; do
    if [[ "$file" != *"config.js"* ]]; then
        echo "Updating $file"
        # Replace localhost:4000 with getApiUrl function
        sed -i 's|"http://localhost:4000/|getApiUrl("/|g' "$file"
        sed -i "s|'http://localhost:4000/|getApiUrl('/|g" "$file"
        # Fix any double quotes issues
        sed -i 's|getApiUrl("/|" + getApiUrl("/|g' "$file"
        sed -i "s|getApiUrl('/|' + getApiUrl('/|g" "$file"
    fi
done

echo "API URL updates completed!"
