#!/usr/bin/env node

const fs = require('fs');
const path = require('path');


function main() {
    // Define the date range - last 28 days ending on August 3, 2025
    const endDate = new Date('2025-08-03');
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 27); // 28 days total (including end date)
    
    console.log(`Analyzing user activity from ${formatDate(startDate)} to ${formatDate(endDate)} (28 days)`);
    console.log('---');
    
    // Find the avocado report file
    const exampleDir = path.join(__dirname, '..', 'example');
    const files = fs.readdirSync(exampleDir);
    const avocadoFile = files.find(file => file.startsWith('avocado-') && file.endsWith('.json'));
    
    if (!avocadoFile) {
        console.error('No avocado report file found in example directory');
        process.exit(1);
    }
    
    const filePath = path.join(exampleDir, avocadoFile);
    console.log(`Reading report: ${avocadoFile}`);
    console.log('---');
    
    // Read and parse the JSONL file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    const uniqueUsers = new Set();
    let totalEntries = 0;
    let entriesInRange = 0;
    
    for (const line of lines) {
        try {
            const entry = JSON.parse(line);
            totalEntries++;
            
            const entryDate = new Date(entry.day);
            
            // Check if the entry date is within our 28-day range
            if (entryDate >= startDate && entryDate <= endDate) {
                entriesInRange++;
                uniqueUsers.add(entry.user_login);
            }
        } catch (error) {
            console.error('Error parsing line:', error.message);
        }
    }
    
    // Convert to array and sort alphabetically
    const sortedUsers = Array.from(uniqueUsers).sort();
    
    // Display results
    console.log(`Total entries in report: ${totalEntries}`);
    console.log(`Entries in date range: ${entriesInRange}`);
    console.log(`Unique users with activity in the last 28 days: ${sortedUsers.length}`);
    console.log('---');
    console.log('Users:');
    
    sortedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user}`);
    });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Run the script
main();
