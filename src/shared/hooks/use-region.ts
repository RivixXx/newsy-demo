'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'newsy_region';

export const RUSSIAN_REGIONS = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирская область',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Краснодар',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Волгоград',
  'Воронеж',
  'Пермь',
  'Тюмень',
  'Саратов',
  'Тольятти',
  'Махачкала',
  'Барнаул',
  'Ижевск',
  'Хабаровск',
  'Ульяновск',
  'Иркутск',
  'Владивосток',
  'Ярославль',
  'Оренбург',
  'Томск',
  'Кемерово',
  'Новокузнецк',
  'Рязань',
  'Астрахань',
  'Набережные Челны',
  'Пенза',
  'Киров',
  'Балашиха',
  'Липецк',
  'Калининград',
  'Тула',
  'Сочи',
  'Красноярск',
  'Сургут',
] as string[];

export type Region = string;

export function useRegion() {
  const [region, setRegionState] = useState<Region | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRegionState(stored);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
    setIsLoaded(true);
  }, []);

  const setRegion = useCallback((r: Region | null) => {
    setRegionState(r);
    if (r) {
      localStorage.setItem(STORAGE_KEY, r);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setShowModal(false);
  }, []);

  const changeRegion = useCallback(() => {
    setShowModal(true);
  }, []);

  const skipRegion = useCallback(() => {
    setRegionState(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowModal(false);
  }, []);

  return { region, isLoaded, showModal, setRegion, changeRegion, skipRegion };
}
