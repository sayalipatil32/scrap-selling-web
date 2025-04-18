// 'use client';
// import { useState } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { toast } from 'sonner';
// import { Loader2 } from 'lucide-react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// // Static scrap types data - can be moved to a separate constants file if needed
// const SCRAP_TYPES = [
//   { value: 'paper', label: 'Paper' },
//   { value: 'plastic', label: 'Plastic' },
//   { value: 'metal', label: 'Metal' },
//   { value: 'electronics', label: 'Electronics' },
//   { value: 'glass', label: 'Glass' },
//   { value: 'copper', label: 'Copper' },
//   { value: 'aluminum', label: 'Aluminum' },
//   { value: 'brass', label: 'Brass' }
// ];

// export default function ScrapForm({ onSuccess }) {
//   const { user } = useUser();
//   const [formData, setFormData] = useState({
//     scrapType: '',
//     kilos: '',
//     price: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate all required fields
//     if (!user?.id) {
//       toast.error('Authentication required');
//       return;
//     }
//     if (!formData.scrapType || !formData.kilos || !formData.price) {
//       toast.error('Please fill all required fields');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch('/api/scrap-sales', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           scrapType: formData.scrapType,
//           kilos: parseFloat(formData.kilos),
//           price: parseFloat(formData.price),
//           sellerId: user.id,
//           date: new Date().toISOString()
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to record sale');
//       }

//       toast.success('Sale recorded successfully!');
//       setFormData({ scrapType: '', kilos: '', price: '' });
//       if (onSuccess) onSuccess();
//     } catch (error) {
//       console.error('Submission error:', error);
//       toast.error('Failed to record sale', {
//         description: error.message
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Card className="max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle className="text-center">Record New Scrap Sale</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Scrap Type Selection */}
//           <div className="space-y-2">
//             <Label htmlFor="scrapType">Scrap Type *</Label>
//             <Select
//               value={formData.scrapType}
//               onValueChange={(value) => setFormData({...formData, scrapType: value})}
//               required
//             >
//               <SelectTrigger id="scrapType">
//                 <SelectValue placeholder="Select type of scrap" />
//               </SelectTrigger>
//               <SelectContent>
//                 {SCRAP_TYPES.map((type) => (
//                   <SelectItem key={type.value} value={type.value}>
//                     {type.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Weight Input */}
//           <div className="space-y-2">
//             <Label htmlFor="kilos">Weight (kg) *</Label>
//             <div className="relative">
//               <Input
//                 id="kilos"
//                 type="number"
//                 placeholder="0.00"
//                 min="0.1"
//                 step="0.1"
//                 value={formData.kilos}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   // Only allow numbers and decimal points
//                   if (value === '' || /^\d*\.?\d*$/.test(value)) {
//                     setFormData({...formData, kilos: value});
//                   }
//                 }}
//                 required
//                 className="pr-10"
//               />
//               <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
//                 kg
//               </span>
//             </div>
//           </div>

//           {/* Price Input */}
//           <div className="space-y-2">
//             <Label htmlFor="price">Price (₹) *</Label>
//             <div className="relative">
//               <Input
//                 id="price"
//                 type="number"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 value={formData.price}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   // Only allow numbers and decimal points
//                   if (value === '' || /^\d*\.?\d*$/.test(value)) {
//                     setFormData({...formData, price: value});
//                   }
//                 }}
//                 required
//                 className="pr-10"
//               />
//               <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
//                 ₹
//               </span>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <Button
//             type="submit"
//             className="w-full mt-6"
//             size="lg"
//             disabled={isSubmitting || !formData.scrapType || !formData.kilos || !formData.price}
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               'Record Scrap Sale'
//             )}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }

'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SCRAP_TYPES = [
  { value: 'paper', label: 'Paper' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'metal', label: 'Metal' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'glass', label: 'Glass' },
  { value: 'copper', label: 'Copper' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'brass', label: 'Brass' }
];

export default function ScrapForm({ onSuccess }) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    scrapType: '',
    kilos: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user?.id) {
      toast.error('Authentication required');
      return;
    }
  
    if (!formData.scrapType || !formData.kilos || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch('/api/scrap', {  // <- This is the only line that changes
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scrapType: formData.scrapType,
          kilos: parseFloat(formData.kilos),
          price: parseFloat(formData.price),
          sellerId: user.id,
          date: new Date().toISOString()
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record sale');
      }
  
      toast.success('Sale recorded successfully!', {
        description: `📦 ${formData.scrapType} | ⚖️ ${formData.kilos} kg | 💰 ₹${formData.price}`
      });
  
      setFormData({ scrapType: '', kilos: '', price: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to record sale', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Record New Scrap Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scrapType">Scrap Type *</Label>
            <Select
              value={formData.scrapType}
              onValueChange={(value) =>
                setFormData({ ...formData, scrapType: value })
              }
              required
            >
              <SelectTrigger id="scrapType">
                <SelectValue placeholder="Select type of scrap" />
              </SelectTrigger>
              <SelectContent>
                {SCRAP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kilos">Weight (kg) *</Label>
            <div className="relative">
              <Input
                id="kilos"
                type="number"
                placeholder="0.00"
                min="0.1"
                step="0.1"
                value={formData.kilos}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, kilos: value });
                  }
                }}
                required
                className="pr-10"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, price: value });
                  }
                }}
                required
                className="pr-10"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                ₹
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            size="lg"
            disabled={
              isSubmitting ||
              !formData.scrapType ||
              !formData.kilos ||
              !formData.price
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Record Scrap Sale'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
