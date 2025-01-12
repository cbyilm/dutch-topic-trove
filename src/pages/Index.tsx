import { useState } from "react";
import { Category, fetchDutchReferenceText } from "@/utils/wikipediaApi";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [category, setCategory] = useState<Category>("health");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newText = await fetchDutchReferenceText(category);
      setText(newText);
      toast({
        title: "Success",
        description: "New reference text generated successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate reference text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text ? text.split(" ").length : 0;

  return (
    <div className="min-h-screen bg-dutch-light p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Dutch Reference Text Generator
          </h1>
          <p className="text-gray-600">
            Generate unique Dutch reference texts from Wikipedia
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as Category)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Health/Medical</SelectItem>
                <SelectItem value="transport">Travel/Transport</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-dutch-orange hover:bg-dutch-orange/90 text-white"
            >
              {loading ? "Generating..." : "Generate Text"}
            </Button>
          </div>

          <div className="relative">
            {text ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg text-gray-800 leading-relaxed">
                  {text}
                </div>
                <p className="text-sm text-gray-500 text-right">
                  Word count: {wordCount}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Click generate to create a reference text
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;