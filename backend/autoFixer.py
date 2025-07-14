#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Автоматический исправитель для backend
Применяет исправления к main.py на основе результатов тестирования моделей
"""

import json
import re
import os
import argparse
import sys
from typing import Dict, List, Any

class BackendAutoFixer:
    def __init__(self, main_py_path: str = "main.py"):
        self.main_py_path = main_py_path
        self.backup_path = f"{main_py_path}.backup"
        
    def create_backup(self) -> bool:
        """Создает резервную копию main.py"""
        try:
            if os.path.exists(self.main_py_path):
                with open(self.main_py_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                with open(self.backup_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Резервная копия создана: {self.backup_path}")
                return True
            else:
                print(f"❌ Файл {self.main_py_path} не найден")
                return False
        except Exception as e:
            print(f"❌ Ошибка при создании резервной копии: {e}")
            return False
    
    def restore_backup(self) -> bool:
        """Восстанавливает main.py из резервной копии"""
        try:
            if os.path.exists(self.backup_path):
                with open(self.backup_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                with open(self.main_py_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Файл восстановлен из резервной копии")
                return True
            else:
                print(f"❌ Резервная копия не найдена")
                return False
        except Exception as e:
            print(f"❌ Ошибка при восстановлении: {e}")
            return False
    
    def read_main_py(self) -> str:
        """Читает содержимое main.py"""
        try:
            with open(self.main_py_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"❌ Ошибка при чтении {self.main_py_path}: {e}")
            return ""
    
    def write_main_py(self, content: str) -> bool:
        """Записывает обновленное содержимое в main.py"""
        try:
            with open(self.main_py_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Файл {self.main_py_path} обновлен")
            return True
        except Exception as e:
            print(f"❌ Ошибка при записи {self.main_py_path}: {e}")
            return False
    
    def update_model_id_map(self, content: str, updates: Dict[str, str]) -> str:
        """Обновляет modelIdMap в main.py"""
        print(f"🔧 Обновляем modelIdMap: {updates}")
        
        updated_content = content
        
        for old_id, new_id in updates.items():
            # Ищем строки с modelIdMap
            pattern = rf"'{old_id}':\s*'[^']*'"
            replacement = f"'{old_id}': '{new_id}'"
            
            if re.search(pattern, updated_content):
                updated_content = re.sub(pattern, replacement, updated_content)
                print(f"  ✅ {old_id} → {new_id}")
            else:
                print(f"  ⚠️ Не найдено: {old_id}")
        
        return updated_content
    
    def add_special_handling(self, content: str, special_handling: Dict[str, Any]) -> str:
        """Добавляет специальную обработку для моделей"""
        print(f"⚙️ Добавляем специальную обработку: {list(special_handling.keys())}")
        
        # Находим место для вставки специальной обработки
        insert_point = content.find("# Специальная обработка для разных моделей")
        
        if insert_point == -1:
            # Если нет места для вставки, добавляем перед обработкой запроса
            insert_point = content.find("async def chat_completion")
            if insert_point == -1:
                print("  ⚠️ Не найдено место для вставки специальной обработки")
                return content
        
        # Генерируем код специальной обработки
        special_handling_code = self.generate_special_handling_code(special_handling)
        
        # Вставляем код
        updated_content = (
            content[:insert_point] + 
            special_handling_code + "\n\n" + 
            content[insert_point:]
        )
        
        return updated_content
    
    def generate_special_handling_code(self, special_handling: Dict[str, Any]) -> str:
        """Генерирует код специальной обработки"""
        code = "# Специальная обработка для разных моделей\n"
        
        for model_id, handling in special_handling.items():
            if 'removeParameters' in handling:
                code += f"if model_id == '{model_id}':\n"
                code += f"    # Убираем неподдерживаемые параметры\n"
                code += f"    body = {{\n"
                code += f"        'model': model_id,\n"
                code += f"        'messages': body['messages']\n"
                code += f"    }}\n\n"
        
        return code
    
    def fix_parameters(self, content: str, parameter_fixes: Dict[str, Any]) -> str:
        """Исправляет параметры для моделей"""
        print(f"🔧 Исправляем параметры: {list(parameter_fixes.keys())}")
        
        # Находим место для вставки исправлений параметров
        insert_point = content.find("# Исправления параметров для разных моделей")
        
        if insert_point == -1:
            # Если нет места для вставки, добавляем перед обработкой запроса
            insert_point = content.find("async def chat_completion")
            if insert_point == -1:
                print("  ⚠️ Не найдено место для вставки исправлений параметров")
                return content
        
        # Генерируем код исправлений параметров
        parameter_fixes_code = self.generate_parameter_fixes_code(parameter_fixes)
        
        # Вставляем код
        updated_content = (
            content[:insert_point] + 
            parameter_fixes_code + "\n\n" + 
            content[insert_point:]
        )
        
        return updated_content
    
    def generate_parameter_fixes_code(self, parameter_fixes: Dict[str, Any]) -> str:
        """Генерирует код исправлений параметров"""
        code = "# Исправления параметров для разных моделей\n"
        
        for model_id, fixes in parameter_fixes.items():
            if 'remove' in fixes:
                code += f"if model_id == '{model_id}':\n"
                code += f"    # Убираем неподдерживаемые параметры\n"
                for param in fixes['remove']:
                    code += f"    body.pop('{param}', None)\n"
                code += "\n"
        
        return code
    
    def apply_fixes(self, fixes: Dict[str, Any]) -> Dict[str, Any]:
        """Применяет все исправления к main.py"""
        print("🤖 Применяем исправления к backend...")
        
        try:
            # Создаем резервную копию
            if not self.create_backup():
                return {"success": False, "error": "Не удалось создать резервную копию"}
            
            # Читаем текущий файл
            content = self.read_main_py()
            if not content:
                return {"success": False, "error": "Не удалось прочитать main.py"}
            
            # Применяем исправления
            updated_content = content
            
            # 1. Обновляем modelIdMap
            if 'modelIdMapUpdates' in fixes:
                updated_content = self.update_model_id_map(updated_content, fixes['modelIdMapUpdates'])
            
            # 2. Добавляем специальную обработку
            if 'specialHandling' in fixes:
                updated_content = self.add_special_handling(updated_content, fixes['specialHandling'])
            
            # 3. Исправляем параметры
            if 'parameterFixes' in fixes:
                updated_content = self.fix_parameters(updated_content, fixes['parameterFixes'])
            
            # Записываем обновленный файл
            if self.write_main_py(updated_content):
                return {"success": True, "message": "Backend успешно обновлен"}
            else:
                return {"success": False, "error": "Не удалось записать обновленный файл"}
            
        except Exception as e:
            print(f"❌ Ошибка при применении исправлений: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_fix_report(self, fixes: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
        """Генерирует отчет об исправлениях"""
        report = {
            "summary": {
                "modelIdUpdates": len(fixes.get('modelIdMapUpdates', {})),
                "specialHandling": len(fixes.get('specialHandling', {})),
                "parameterFixes": len(fixes.get('parameterFixes', {}))
            },
            "fixes": fixes,
            "result": result
        }
        
        return report

def main():
    """Основная функция для применения исправлений"""
    parser = argparse.ArgumentParser(description='Автоматический исправитель backend')
    parser.add_argument('--fixes', type=str, help='Путь к файлу с исправлениями')
    parser.add_argument('--test', action='store_true', help='Запустить тест')
    parser.add_argument('--restore', action='store_true', help='Восстановить из резервной копии')
    
    args = parser.parse_args()
    
    fixer = BackendAutoFixer()
    
    if args.test:
        # Тестовый режим
        test_fixes = {
            "modelIdMapUpdates": {
                "midjourney": "midjourney-v6",
                "dalle": "dall-e-3"
            },
            "specialHandling": {
                "midjourney": {
                    "removeParameters": ["temperature", "top_p", "max_tokens"]
                }
            },
            "parameterFixes": {
                "openai/codex": {
                    "remove": ["frequency_penalty", "presence_penalty"]
                }
            }
        }
        
        print("🧪 Тестируем автоматический исправитель backend...")
        result = fixer.apply_fixes(test_fixes)
        
        if result["success"]:
            print("✅ Тест успешен!")
            report = fixer.generate_fix_report(test_fixes, result)
            print(f"📊 Отчет: {report}")
        else:
            print(f"❌ Тест не прошел: {result['error']}")
            sys.exit(1)
    
    elif args.fixes:
        # Режим применения исправлений
        try:
            with open(args.fixes, 'r', encoding='utf-8') as f:
                fixes = json.load(f)
            
            print(f"🔧 Применяем исправления из файла: {args.fixes}")
            result = fixer.apply_fixes(fixes)
            
            if result["success"]:
                print("✅ Исправления успешно применены!")
                report = fixer.generate_fix_report(fixes, result)
                print(f"📊 Отчет: {json.dumps(report, ensure_ascii=False, indent=2)}")
                sys.exit(0)
            else:
                print(f"❌ Ошибка при применении исправлений: {result['error']}")
                sys.exit(1)
                
        except Exception as e:
            print(f"❌ Ошибка при чтении файла исправлений: {e}")
            sys.exit(1)
    
    elif args.restore:
        # Режим восстановления
        print("🔄 Восстанавливаем файл из резервной копии...")
        if fixer.restore_backup():
            print("✅ Файл успешно восстановлен!")
            sys.exit(0)
        else:
            print("❌ Ошибка при восстановлении файла")
            sys.exit(1)
    
    else:
        print("❌ Необходимо указать --fixes, --test или --restore")
        sys.exit(1)

if __name__ == "__main__":
    main() 