'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function LanguagePreview() {
  return <Card className="raise lg"><Tabs defaultValue="en">
    <TabsList aria-label="Resume preview language"><TabsTrigger value="en">English</TabsTrigger><TabsTrigger value="ar" lang="ar">العربية</TabsTrigger></TabsList>
    {(['en', 'ar'] as const).map(language => <TabsContent key={language} value={language}>
      <div className="paper" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}>
        <b>{language === 'ar' ? 'اسمك' : 'Your name'}</b><span>{language === 'ar' ? 'مطوّر برمجيات' : 'Software developer'}</span>
        <i aria-hidden="true" /><i className="w" aria-hidden="true" /><i aria-hidden="true" /><i className="w" aria-hidden="true" />
      </div>
    </TabsContent>)}
  </Tabs></Card>;
}
