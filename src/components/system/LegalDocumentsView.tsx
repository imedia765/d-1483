import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";

const LegalDocumentsView = () => {
  const { toast } = useToast();

  const generatePDF = (content: string, title: string) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, 20, 20);
      
      // Add content with word wrap
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(content, 170);
      doc.text(splitText, 20, 40);
      
      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "Success",
        description: "Document has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-dashboard-card border-dashboard-cardBorder">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-dashboard-accent1" />
            <h3 className="text-xl font-semibold text-white">Medical Examiner Process</h3>
          </div>
          <Button 
            onClick={() => generatePDF(
              "Medical Examiner Process document content...",
              "Medical Examiner Process"
            )}
            variant="outline"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/fe2d6e55-ff9b-4259-8e04-ad013282b7fe.png" 
            alt="Medical Certificate of Cause of Death" 
            className="w-full rounded-lg shadow-md"
          />
          <img 
            src="/lovable-uploads/6e209600-d2c6-452c-aa45-c30e0f473afb.png" 
            alt="Ethnicity and Medical Devices Form" 
            className="w-full rounded-lg shadow-md"
          />
        </div>
      </Card>

      <Card className="p-6 bg-dashboard-card border-dashboard-cardBorder">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-dashboard-accent1" />
            <h3 className="text-xl font-semibold text-white">PWA Collector Member Responsibilities</h3>
          </div>
          <Button 
            onClick={() => generatePDF(
              "A Collector member is a senior member of the PWA who is responsible for a specific number of paying members who are part of the death committee...",
              "PWA Collector Member Responsibilities"
            )}
            variant="outline"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-dashboard-text">
            A Collector member is a senior member of the PWA who is responsible for a specific number of paying
            members who are part of the death committee.
          </p>
          <p className="font-semibold text-dashboard-accent1 mt-4">The Collector will be responsible for the following:</p>
          <ol className="list-decimal pl-6 space-y-2 text-dashboard-text">
            <li className="hover:text-dashboard-accent2 transition-colors">Act as the representative of the death committee for each member on their list.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Act as first point of contact for any enquiries from members or prospective members.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Register new members with the death committee.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Communicate announcements from death committee to members.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Collect member's fees whenever a collection is due.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Keep a record of all members' payments made in to PWA bank account.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Act as conduit between the members and death committee Senior Leadership Team (SLT).</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Attending Collectors meetings with other members.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Provide guidance to new members and prospective members.</li>
            <li className="hover:text-dashboard-accent2 transition-colors">Feedback any issues or concerns to the PWA SLT.</li>
          </ol>
        </div>
      </Card>

      <Card className="p-6 bg-dashboard-card border-dashboard-cardBorder">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-dashboard-accent1" />
            <h3 className="text-xl font-semibold text-white">Pakistan Welfare Association Membership Terms</h3>
          </div>
          <Button 
            onClick={() => generatePDF(
              "Pakistan Welfare Association Membership Terms...",
              "PWA Membership Terms"
            )}
            variant="outline"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
        <div className="space-y-6 text-dashboard-text">
          <section className="space-y-4">
            <h3 className="font-semibold text-dashboard-accent2">1. Members Eligibility</h3>
            <p>Only Muslims can be members of Pakistan Welfare Association (PWA).</p>

            <h3 className="font-semibold text-dashboard-accent2">2. Membership Fee</h3>
            <p>Any new members must pay a membership fee plus the collection amount for that calendar year. Currently the membership fee is £150 as of January 2024.</p>

            <h3 className="font-semibold text-dashboard-accent2">3. Dependents Registration</h3>
            <p>All members will be given a membership number and will need to register their dependents.</p>

            <h3 className="font-semibold text-dashboard-accent2">4. Health Declaration</h3>
            <p>New members must be in good health, with no known terminal illnesses.</p>

            <h3 className="font-semibold text-dashboard-accent2">5. Payment Terms</h3>
            <p>Payments will need to be made within 28 days from collection date. This will take place annually from 1st January and no later than 29th January.</p>

            <div className="mt-8 pt-4 border-t border-dashboard-cardBorder">
              <p className="text-dashboard-accent3 font-semibold italic">
                By becoming a member of the Pakistan Welfare Association, you agree to abide by these terms and conditions outlined above.
              </p>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default LegalDocumentsView;