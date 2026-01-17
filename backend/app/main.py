from fastapi import FastAPI

app = FastAPI(title="Superhero API")

@app.get("/")
def root():
    return {"message": "Superhero API is running"}