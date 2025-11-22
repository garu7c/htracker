import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Lightbulb, Moon, CheckCircle } from 'lucide-react';

const SleepTips = () => {
    
    const tips = [
        { text: 'Mantén un horario consistente de sueño', color: 'bg-purple-100 text-purple-700', icon: <Moon className="h-4 w-4" /> },
        { text: 'Evita pantallas 1 hora antes de dormir', color: 'bg-indigo-100 text-indigo-700', icon: <Lightbulb className="h-4 w-4" /> },
        { text: 'Mantén tu habitación fresca y oscura', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" /> },
        { text: 'Limita la cafeína y el alcohol por la tarde', color: 'bg-yellow-100 text-yellow-700', icon: <Lightbulb className="h-4 w-4" /> },
    ];

    return (
        <Card className="shadow-md border-2 border-gray-100 h-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" /> Consejos para un Mejor Descanso
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {tips.map((tip, index) => (
                    <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${tip.color}`}>
                        <div className="pt-0.5">{tip.icon}</div>
                        <span className="text-sm font-medium">{tip.text}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default SleepTips;