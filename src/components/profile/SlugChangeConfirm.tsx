import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface SlugChangeConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  oldSlug: string;
  newSlug: string;
}

export function SlugChangeConfirm({ 
  open, 
  onOpenChange, 
  onConfirm, 
  oldSlug, 
  newSlug 
}: SlugChangeConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>Confirmar mudança de URL</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-3 mt-2">
                  <p>
                    Você está prestes a alterar o slug da sua empresa. 
                    Isso mudará a URL de acesso do seu estabelecimento.
                  </p>
                  
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">URL Atual:</p>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <ExternalLink className="w-3 h-3" />
                        <span>https://somarcar.com.br/<strong>{oldSlug}</strong></span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400 mb-1">Nova URL:</p>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <ExternalLink className="w-3 h-3" />
                        <span>https://somarcar.com.br/<strong>{newSlug}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-amber-800 dark:text-amber-300 text-xs font-medium">
                      ⚠️ Atenção:
                    </p>
                    <ul className="text-amber-700 dark:text-amber-400 text-xs mt-1 space-y-1 list-disc list-inside">
                      <li>Links antigos podem parar de funcionar</li>
                      <li>Clientes com a URL antiga salva precisarão atualizar</li>
                      <li>Pode afetar o SEO do seu negócio</li>
                    </ul>
                  </div>
                </div>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Sim, alterar URL
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
