import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, ShieldCheck, Loader2, AlertCircle, Server, Cloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import { useLicenseStore } from '@/app/store/useLicenseStore';
import { useDashboardStore } from '../store/useDashboardStore';
import { useConveyor } from '@/app/hooks/use-conveyor';

interface LicenseDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LicenseDialog = ({ open, onClose }: LicenseDialogProps) => {
  const { t } = useTranslation();
  const { hwid, setAuthData } = useDashboardStore();
  const serverApi = useConveyor('server');
  
  const { 
    licenseKey, licenseMode, enableLocal, enableCloud, 
    setLicenseData, setEnableLocal, setEnableCloud 
  } = useLicenseStore();
  
  const [inputKey, setInputKey] = useState(licenseKey);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) setInputKey(licenseKey);
  }, [open, licenseKey]);

  const verifyLicense = async () => {
    if (!inputKey.trim()) return toast.error('لطفاً لایسنس را وارد کنید.');
    if (!hwid) return toast.error('شناسه سخت‌افزاری یافت نشد.');

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8595/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: inputKey.trim(), hwid: hwid }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        if (data.type === 'pro' || data.type === 'trial') {
          // دریافت سطح دسترسی کپی‌ترید از سرور (LOCAL, CLOUD, BOTH)
          setLicenseData(inputKey.trim(), data.copyTradeMode || 'BOTH');
          setAuthData(inputKey.trim(), 'master');
          toast.success('لایسنس تایید شد.', { description: data.message });
        } else {
          toast.error('این داشبورد مخصوص ارائه‌دهندگان سیگنال است.');
        }
      } else {
        toast.error('خطا در بررسی لایسنس', { description: data.message });
        setLicenseData('', 'DISABLED');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalToggle = async (checked: boolean) => {
    setEnableLocal(checked);
    if (checked) {
      toast.info('حالت کپی محلی فعال شد. از بالا سرور رله را استارت کنید.');
    } else {
      await serverApi.stop();
      toast.info('حالت کپی محلی خاموش شد.');
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
            تنظیمات لایسنس و کپی‌تریدینگ
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
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                disabled={!hwid}
                dir="ltr"
              />
            </div>
            <Button onClick={verifyLicense} disabled={isLoading || !hwid}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بررسی'}
            </Button>
          </div>

          {!hwid && (
            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 mt-4 rounded border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>در حال خواندن شناسه از متاتریدر...</span>
            </div>
          )}

          {/* پنل انتخاب مسیر کپی‌ترید */}
          <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
            <h4 className="text-sm font-medium mb-2 border-b border-border pb-2">مسیر ارسال سیگنال‌ها</h4>
            
            {/* گزینه Local */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium cursor-pointer" htmlFor="local-toggle">شبکه محلی (Local LAN/VPS)</label>
                  <p className="text-xs text-muted-foreground">کپی روی همین سیستم بدون نیاز به اینترنت</p>
                </div>
              </div>
              <Switch
                id="local-toggle"
                checked={enableLocal}
                onCheckedChange={handleLocalToggle}
                disabled={!isLocalAllowed}
              />
            </div>

            {/* گزینه Cloud */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="space-y-0.5 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium cursor-pointer" htmlFor="cloud-toggle">شبکه ابری (Cloud HFT)</label>
                  <p className="text-xs text-muted-foreground">ارسال به روتر زنگار (Rust) برای مشتریان راه دور</p>
                </div>
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