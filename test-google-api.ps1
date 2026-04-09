$body = @{
    title = "AI Chatbot for Customer Service"
    description = "A machine learning-powered chatbot that handles customer support tickets automatically using natural language processing and AI"
} | ConvertTo-Json

try {
    Write-Host "Testing API with Google Gemini..."
    $response = Invoke-WebRequest -Uri "http://localhost:5000/ideas" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 20
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)" | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
