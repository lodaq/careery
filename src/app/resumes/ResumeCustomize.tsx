'use client';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { FieldLabel } from '@/components/ui/field';

import { useId, useState, type ReactNode } from 'react';
import { ScaledResumeDocument } from '@/template/ScaledResumeDocument';
import { resolveResume } from '@/lib/resolver';
import type { Resume } from '@/lib/types';
import type { Language, ResumeAppearance } from '../../lib/types';
import { ResumeIcon } from './ResumeIcon';
import { defaultAppearance, stylePresets, templates } from './appearance';
export function ResumeCustomize({ appearance, onChange, language, onLanguageChange, layout, resume }: { appearance: ResumeAppearance; onChange: (appearance: ResumeAppearance) => void; language: Language; onLanguageChange: (language: Language) => void; layout: ReactNode; resume?: Resume }) {
  const [tab, setTab] = useState('Style'), [styleTab, setStyleTab] = useState('Fonts'), id = useId();
  const update = (values: Partial<ResumeAppearance>) => onChange({ ...appearance, ...values });
  return <div className="customize-editor">
    <ToggleGroup className="customize-tabs" aria-label="Customize view" value={[tab]} onValueChange={(values)=>{ if(values[0]) setTab(values[0]); }}>{['Style', 'Layout', 'Template'].map((name)=><ToggleGroupItem key={name} value={name}>{name}</ToggleGroupItem>)}</ToggleGroup>
    <div hidden={tab !== 'Style'}>
      <div className="customize-intro"><span className="customize-symbol"><ResumeIcon kind="palette" /></span><div><h2>Customize resume</h2><p>Change template, spacing, sections, and visual details.</p></div></div>
      <div className="customize-card"><h3>Style presets</h3><p>Start with a direction, then fine-tune the details.</p><div className="preset-grid">{stylePresets.map((preset) => <Button variant="outline" type="button" key={preset.name} onClick={() => onChange({ ...preset.value })}><strong>{preset.name}</strong><span>{preset.description}</span></Button>)}</div></div>
      <ToggleGroup className="customize-tabs style-tabs" aria-label="Style controls" value={[styleTab]} onValueChange={(values)=>{ if(values[0]) setStyleTab(values[0]); }}>{['Fonts', 'Colors', 'Spacing'].map((name)=><ToggleGroupItem key={name} value={name}>{name}</ToggleGroupItem>)}</ToggleGroup>
      <div className="customize-card" hidden={styleTab !== 'Fonts'}><h3>Typography</h3><p>Tune the personality and density of the resume text.</p>
        <FieldLabel htmlFor={`${id}-font`}>Font family</FieldLabel><NativeSelect id={`${id}-font`} value={appearance.font} onChange={(event) => update({ font: event.target.value === 'sans' ? 'sans' : event.target.value === 'mono' ? 'mono' : 'serif' })}><NativeSelectOption value="serif">Georgia · Classic serif</NativeSelectOption><NativeSelectOption value="sans">Arial · Clean sans serif</NativeSelectOption><NativeSelectOption value="mono">Courier New · Monospace</NativeSelectOption></NativeSelect>
        <FieldLabel htmlFor={`${id}-body`} className="range-label">Body size <output>{appearance.bodySize}pt</output></FieldLabel><Slider id={`${id}-body`} aria-label="Body size" min={8} max={13} step={0.5} value={[appearance.bodySize]} onValueChange={(values) => update({ bodySize: Array.isArray(values) ? values[0] : values })} />
        <FieldLabel htmlFor={`${id}-name`} className="range-label">Name size <output>{appearance.nameSize}pt</output></FieldLabel><Slider id={`${id}-name`} aria-label="Name size" min={18} max={32} step={1} value={[appearance.nameSize]} onValueChange={(values) => update({ nameSize: Array.isArray(values) ? values[0] : values })} />
      </div>
      <div className="customize-card" hidden={styleTab !== 'Colors'}><h3>Colors</h3><p>A subtle accent for your name and section headings.</p><div className="accent-swatches">{['#344b8e', '#315e55', '#51416b', '#252525', '#814942', '#4b626f'].map((color) => <Button variant="outline" type="button" key={color} aria-label={`Use accent ${color}`} aria-pressed={appearance.accent === color} style={{ backgroundColor: color }} onClick={() => update({ accent: color })}>{appearance.accent === color ? '✓' : ''}</Button>)}</div><FieldLabel htmlFor={`${id}-color`}>Custom accent</FieldLabel><Input id={`${id}-color`} type="color" value={appearance.accent} onChange={(event) => update({ accent: event.target.value })} /></div>
      <div className="customize-card" hidden={styleTab !== 'Spacing'}><h3>Spacing</h3><p>Adjust breathing room while keeping the text readable.</p><FieldLabel htmlFor={`${id}-spacing`} className="range-label">Line spacing <output>{appearance.spacing.toFixed(1)}</output></FieldLabel><Slider id={`${id}-spacing`} aria-label="Line spacing" min={1.1} max={1.8} step={0.1} value={[appearance.spacing]} onValueChange={(values) => update({ spacing: Array.isArray(values) ? values[0] : values })} /></div>
    </div>
    <div hidden={tab !== 'Layout'} className="customize-layout"><div className="customize-intro"><div><h2>Layout</h2><p>Drag sections to reorder. With a handle focused, use Arrow Up or Arrow Down.</p></div><Button variant="outline" type="button" onClick={() => onChange({ ...defaultAppearance })}>Reset style</Button></div><div className="customize-card"><FieldLabel htmlFor={`${id}-language`}>Resume language</FieldLabel><NativeSelect id={`${id}-language`} value={language} onChange={(event) => onLanguageChange(event.target.value === 'ar' ? 'ar' : 'en')}><NativeSelectOption value="en">English</NativeSelectOption><NativeSelectOption value="ar">Arabic</NativeSelectOption></NativeSelect></div><div className="customize-card">{layout}</div></div>
    <div hidden={tab !== 'Template'}><div className="customize-intro"><span className="customize-symbol"><ResumeIcon kind="template" /></span><div><h2>Choose a template</h2><p>Explore the collection and choose the look that fits you.</p></div></div><div className="template-grid">{tab === 'Template' ? templates.map(([key, name]) => <Button variant="outline" className={`template-tile tile-${key}`} type="button" key={key} aria-pressed={appearance.template === key} onClick={() => update({ template: key })}><div className="template-thumbnail" aria-hidden="true">{resume ? <ScaledResumeDocument document={resolveResume({ ...resume, appearance: { ...appearance, template: key } })} /> : <strong>{name}</strong>}</div><span>{name}</span>{appearance.template === key ? <span className="template-selected"><ResumeIcon kind="check" /></span> : null}</Button>) : null}</div></div>
  </div>;
}
