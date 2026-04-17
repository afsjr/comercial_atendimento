'use client';

import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Contact, PipelineStage } from '@/types/database.types';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  stages: PipelineStage[];
  onSubmit: (data: any) => Promise<void>;
}

const initialFormData = {
  title: '',
  contact_id: '',
  value: '',
  expected_close_date: '',
  course_interest: '',
};

const courseOptions = [
  { value: '', label: 'Selecione um curso (opcional)' },
  { value: 'gestao_empresarial', label: 'Gestão Empresarial' },
  { value: 'gestao_de_pessoas', label: 'Gestão de Pessoas' },
  { value: 'gestao_financeira', label: 'Gestão Financeira' },
  { value: 'gestao_de_projetos', label: 'Gestão de Projetos' },
  { value: 'gestao_publica', label: 'Gestão Pública' },
  { value: 'logistica', label: 'Logística' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'outro', label: 'Outro' },
];

export function NewDealModal({ isOpen, onClose, contacts, stages, onSubmit }: NewDealModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [contactSearch, setContactSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.contact_id) {
      setError('Título e contato são obrigatórios');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData(initialFormData);
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase())) ||
    (c.phone && c.phone.includes(contactSearch))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Oportunidade"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            Oportunidade criada com sucesso!
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ex: Interesse em Gestão Empresarial"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Contato *
          </label>
          <input
            type="text"
            placeholder="Buscar contato..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
          />
          <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-md">
            {filteredContacts.length === 0 ? (
              <p className="p-3 text-sm text-zinc-500 text-center">
                Nenhum contato encontrado
              </p>
            ) : (
              filteredContacts.map(contact => (
                <label
                  key={contact.id}
                  className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-zinc-50 ${
                    formData.contact_id === contact.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="contact_id"
                    value={contact.id}
                    checked={formData.contact_id === contact.id}
                    onChange={handleInputChange}
                    className="text-indigo-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {contact.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {contact.email || contact.phone || 'Sem informações'}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Valor Estimado
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full pl-8 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Previsão de Fechamento
            </label>
            <input
              type="date"
              name="expected_close_date"
              value={formData.expected_close_date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Curso de Interesse
          </label>
          <select
            name="course_interest"
            value={formData.course_interest}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {courseOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : 'Criar Oportunidade'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
