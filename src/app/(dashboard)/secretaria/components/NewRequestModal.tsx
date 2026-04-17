'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Contact } from '@/types/database.types';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSubmit: (data: any) => Promise<void>;
}

const typeOptions = [
  { value: 'info_curso', label: 'Informação sobre Curso' },
  { value: 'matricula', label: 'Matrícula' },
  { value: 'financeiro', label: 'Assunto Financeiro' },
  { value: 'documentacao', label: 'Documentação' },
  { value: 'outro', label: 'Outro' },
];

const priorityOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const initialFormData = {
  contact_id: '',
  type: 'info_curso',
  course_id: '',
  priority: 'normal',
  notes: '',
};

export function NewRequestModal({ isOpen, onClose, contacts, onSubmit }: NewRequestModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [contactSearch, setContactSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_id) {
      setError('Selecione um contato');
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
      title="Nova Solicitação"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            Solicitação criada com sucesso!
          </div>
        )}

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
                  className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-zinc-50 transition-colors ${
                    formData.contact_id === contact.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
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

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Tipo de Solicitação *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Prioridade
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Descreva a solicitação detalhadamente..."
          />
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
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {saving ? 'Criando...' : 'Criar Solicitação'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
