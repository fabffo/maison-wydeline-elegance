import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

// Tableau d'équivalences pointures
const sizeEquivalences = [
  { france: 41, uk: 7, usa: "9.5–10", cm: "26.4" },
  { france: 42, uk: 8, usa: "9", cm: "27.0" },
  { france: 43, uk: 9, usa: "10", cm: "27.7" },
  { france: 44, uk: 10, usa: "11", cm: "28.3" },
  { france: 45, uk: 11, usa: "12", cm: "29.6" },
  { france: 46, uk: 12, usa: "13", cm: "29.5" },
  { france: 47, uk: 13, usa: "14", cm: "30.0" },
];

// Illustrations SVG pour chaque étape
const StepIllustration1 = () => (
  <svg viewBox="0 0 80 60" className="w-16 h-12 text-muted-foreground">
    {/* Deux feuilles A4 */}
    <rect x="10" y="5" width="28" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
    <rect x="12" y="7" width="28" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
    {/* Ligne de séparation (scotch) */}
    <line x1="10" y1="25" x2="40" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    {/* Stylo */}
    <line x1="55" y1="8" x2="65" y2="45" stroke="currentColor" strokeWidth="2" />
    <polygon points="65,45 62,50 68,50" fill="currentColor" />
  </svg>
);

import footMeasurementImg from '@/assets/foot-measurement.png';

const StepIllustration2 = () => (
  <img src={footMeasurementImg} alt="Pied posé sur le papier" className="w-16 h-14 object-contain" />
);

import footMeasurementStep3Img from '@/assets/foot-measurement-step3.png';

const StepIllustration3 = () => (
  <img src={footMeasurementStep3Img} alt="Tracé derrière le talon" className="w-16 h-14 object-contain" />
);

import footMeasurementStep4Img from '@/assets/foot-measurement-step4.png';

const StepIllustration4 = () => (
  <img src={footMeasurementStep4Img} alt="Tracé devant l'orteil" className="w-16 h-14 object-contain" />
);

import footMeasurementStep5Img from '@/assets/foot-measurement-step5.png';

const StepIllustration5 = () => (
  <img src={footMeasurementStep5Img} alt="Mesure du pied en cm" className="w-20 h-10 object-contain" />
);

const stepIllustrations = [
  StepIllustration1,
  StepIllustration2,
  StepIllustration3,
  StepIllustration4,
  StepIllustration5,
];

const steps = [
  "Scotchez deux feuilles de papier A4 ou prenez une feuille A3",
  "Posez votre pied à plat sur la grande feuille de papier",
  "Tracez un trait juste derrière votre talon",
  "Tracez un trait au bout de votre orteil le plus long",
  "Mesurez l'écart entre les deux points : c'est votre pointure en centimètre",
];

const SizeGuideContent = () => (
  <div className="space-y-6">
    <p className="text-sm text-muted-foreground text-center">
      Prenez 2 minutes pour vérifier votre pointure avant commande.
    </p>

    {/* Section Comment mesurer */}
    <div className="bg-muted/30 border border-border rounded-2xl p-5">
      <h3 className="font-semibold text-lg mb-1 text-center">Comment mesurer et connaître sa pointure</h3>
      <div className="w-16 h-0.5 bg-foreground mx-auto mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonne gauche : étapes 1-3 */}
        <div className="space-y-5">
          {steps.slice(0, 3).map((step, index) => {
            const Illustration = stepIllustrations[index];
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-16 flex items-center justify-center bg-muted/50 rounded-lg">
                  <Illustration />
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="flex-shrink-0 text-sm font-semibold">{index + 1}.</span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Colonne droite : étapes 4-5 */}
        <div className="space-y-5">
          {steps.slice(3).map((step, index) => {
            const Illustration = stepIllustrations[index + 3];
            return (
              <div key={index + 3} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-16 flex items-center justify-center bg-muted/50 rounded-lg">
                  <Illustration />
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="flex-shrink-0 text-sm font-semibold">{index + 4}.</span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Section Équivalences */}
    <div className="bg-muted/30 border border-border rounded-2xl p-5">
      <h3 className="font-medium text-base mb-3">Les équivalences</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Vous trouverez ici les mensurations auxquelles correspondent les chaussures Maison Wydeline.
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-3 px-3 text-center font-semibold border-b border-border">FRANCE</th>
              <th className="py-3 px-3 text-center font-semibold border-b border-border">UK</th>
              <th className="py-3 px-3 text-center font-semibold border-b border-border">USA</th>
              <th className="py-3 px-3 text-center font-semibold border-b border-border">LONGUEUR (CM)</th>
            </tr>
          </thead>
          <tbody>
            {sizeEquivalences.map((row) => (
              <tr key={row.france} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="py-2.5 px-3 text-center">{row.france}</td>
                <td className="py-2.5 px-3 text-center">{row.uk}</td>
                <td className="py-2.5 px-3 text-center">{row.usa}</td>
                <td className="py-2.5 px-3 text-center">{row.cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Conseil */}
    <p className="text-xs text-muted-foreground text-center italic">
      💡 Conseil : mesurez vos deux pieds et prenez la mesure la plus grande.
    </p>
  </div>
);

export const SizeGuideDialog = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const trigger = (
    <Button
      variant="link"
      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground underline-offset-4"
      aria-label="Ouvrir le guide des tailles"
    >
      <Ruler className="w-4 h-4 mr-1" />
      Guide des tailles
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl">Guide des tailles</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            <SizeGuideContent />
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Fermer
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Guide des tailles</DialogTitle>
        </DialogHeader>
        <SizeGuideContent />
        <div className="pt-4">
          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour la page dédiée (sans modale)
export const SizeGuidePage = () => (
  <main className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-6 max-w-2xl">
      <h1 className="text-3xl md:text-4xl font-medium text-center mb-2">
        Guide des tailles
      </h1>
      <SizeGuideContent />
    </div>
  </main>
);

export default SizeGuideDialog;
