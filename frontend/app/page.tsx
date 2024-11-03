'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload } from 'lucide-react'

// Create a separate client component
function ImageUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [parsedText, setParsedText] = useState<string>('')

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const response = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log("Backend response data:", data);

        if (Array.isArray(data.wordsWithPositions)) {
          const text = data.wordsWithPositions
            .map((word: { text: string }) => word.text)
            .join(' ');
          setParsedText(text);
        } else {
          console.error("Expected an array but got:", data.wordsWithPositions);
          setParsedText('');
        }
      } catch (error) {
        console.error("Error fetching parsed text:", error);
        setParsedText('');
      }
    }
  }

  return (
    <div className="min-h-screen bg-dotted-pattern bg-repeat bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border-2 border-gray-300">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 font-handwritten">Image Upload & Parse</h1>
        <div className="mb-6">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center hover:border-gray-600 transition-colors">
              <Upload className="mx-auto mb-2 text-gray-400" size={48} />
              <p className="text-sm text-gray-600">Click to upload an image or drag and drop</p>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        {image && (
          <div className="mb-6">
            <img src={image} alt="Uploaded" className="w-full h-auto rounded-lg shadow-md" />
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 font-handwritten">Parsed Text</h2>
          <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] font-handwritten text-gray-700">
            {parsedText || "No text parsed yet. Upload an image to see the result."}
          </div>
        </div>
        <Button
          onClick={() => {
            setImage(null)
            setParsedText('')
          }}
          className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Clear
        </Button>
      </Card>
    </div>
  )
}

// Export the page component
export default function Page() {
  return <ImageUploader />
}
