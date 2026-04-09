$body = @{
    title = "AI Chatbot for Customer Service"
    description = "A machine learning-powered chatbot that handles customer support tickets automatically using natural language processing"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/ideas" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Full Error: $_"
}
