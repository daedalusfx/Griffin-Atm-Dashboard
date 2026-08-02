// app/components/LicenseDialog.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, ShieldCheck, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';
import { useLicenseStore } from '@/app/store/useLicenseStore';
import { useConveyor } from '@/app/hooks/use-conveyor';

interface LicenseDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LicenseDialog = ({ open, onClose }: LicenseDialogProps) => {
  const { t } = useTranslation();
  const serverApi = useConveyor('server');
  
  const { 
    licenseKey, licenseMode, enableLocal, enableCloud, 
    setLicenseData, setEnableLocal, setEnableCloud 
  } = useLicenseStore();

  const [inputKey, setInputKey] = useState(licenseKey);
  const [isLoading, setIsLoading] = useState(false);

  // سینک کردن مقدار اینپوت با استور در زمان باز شدن
  useEffect(() => {
    if (open) setInputKey(licenseKey);
  }, [open, licenseKey]);

  // هندل کردن تغییر وضعیت رله محلی (فقط آپدیت استیت)
  const handleLocalToggle = (checked: boolean) => {
    setEnableLocal(checked);
    if (checked) {
      toast.info('حالت رله محلی باز شد. می‌توانید آن را از نوار بالا استارت کنید.');
    } else {
      toast.info('حالت رله محلی قفل شد.');
    }
  };

  const verifyLicense = async () => {
    if (!inputKey.trim()) return toast.error('لطفاً کلید لایسنس را وارد کنید');
    
    setIsLoading(true);
    try {
      // ارتباط با NestJS (آدرس سرور خودت رو جایگزین کن)
      const response = await fetch('http://localhost:3000/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: inputKey, hwid: 'ELECTRON-USER-HWID' }), // بعداً HWID واقعی رو می‌گیریم
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setLicenseData(inputKey, data.copyTradeMode || 'DISABLED');
        toast.success('لایسنس با موفقیت تایید شد');
      } else {
        toast.error(data.message || 'لایسنس نامعتبر است');
        setLicenseData('', 'DISABLED');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور تایید لایسنس');
    } finally {
      setIsLoading(false);
    }
  };

  const isLocalAllowed = licenseMode === 'LOCAL' || licenseMode === 'BOTH';
  const isCloudAllowed = licenseMode === 'CLOUD' || licenseMode === 'BOTH';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            مجوز و کپی‌ترید
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9 font-mono text-sm" 
                placeholder="GRIFFIN-XXXX-XXXX" 
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
            </div>
            <Button onClick={verifyLicense} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بررسی'}
            </Button>
          </div>

          <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
            <h4 className="text-sm font-medium mb-4">تنظیمات مسیردهی سیگنال</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium cursor-pointer" htmlFor="local-toggle">رله شبکه محلی (Local)</label>
                <p className="text-xs text-muted-foreground">ارسال به متاتریدرهای روی همین سیستم</p>
              </div>
              <Switch 
                id="local-toggle" 
                checked={enableLocal} 
                onCheckedChange={handleLocalToggle}
                disabled={!isLocalAllowed} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium cursor-pointer" htmlFor="cloud-toggle">موتور ابری (Cloud HFT)</label>
                <p className="text-xs text-muted-foreground">ارسال پرسرعت سیگنال روی اینترنت</p>
              </div>
              <Switch 
                id="cloud-toggle" 
                checked={enableCloud} 
                onCheckedChange={(v) => setEnableCloud(v)}
                disabled={!isCloudAllowed} 
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};