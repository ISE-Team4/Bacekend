from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

from typing import Tuple, Dict, List, Union
import argparse
import time
from datetime import datetime

# Chrome WebDriver 경로 설정 (본인의 환경에 맞게 수정)
WEBDRIVER_PATH = './chromedriver'
SERVICE = Service(WEBDRIVER_PATH)
OPTIONS = webdriver.ChromeOptions()
OPTIONS.add_argument('--start-maximized')  # 브라우저 창 최대화


def init_driver() -> webdriver.Chrome:
    # Chrome WebDriver 인스턴스 생성
    driver = webdriver.Chrome(service=SERVICE , options=OPTIONS)

    return driver


def login_skku(driver: webdriver.Chrome, user_id: str, user_pwd: str) -> webdriver.Chrome:
    """_summary_
    성균관대 홈페이지 로그인
    Args:
        driver (webdriver.Chrome): WebDriver 인스턴스
        user_id (str): 로그인할 사용자 ID
        user_pwd (str): 로그인할 사용자 비밀번호

    Returns:
        driver (webdriver.Chrome): WebDriver 인스턴스
    """
    # print(user_id, user_pwd)
    driver.get('https://eportal.skku.edu')

    user_id_input = driver.find_element('id', 'userid')
    user_pwd_input = driver.find_element('id', 'userpwd')

    user_id_input.send_keys(user_id)
    user_pwd_input.send_keys(user_pwd)

    user_pwd_input.send_keys(Keys.RETURN)
    time.sleep(5)

    return driver


def enter_gls(driver: webdriver.Chrome) -> webdriver.Chrome:
    """_summary_
    GLS 페이지로 이동
    Args:
        driver (webdriver.Chrome): WebDriver 인스턴스

    Returns:
        driver (webdriver.Chrome): WebDriver 인스턴스
    """
    driver.get('https://eportal.skku.edu/wps/myportal/std')
    driver.implicitly_wait(1000)
    element = driver.find_element(By.XPATH, '//a[@title="GLS"]')
    element.click()
    driver.switch_to.window(driver.window_handles[-1])

    return driver


def open_reservation_popup(driver: webdriver.Chrome) -> webdriver.Chrome:
    """_summary_
    공간대여신청 (예약신청) 팝업창 열기
    Args:
        driver (webdriver.Chrome): _description_

    Returns:
        webdriver.Chrome: _description_
    """
    wait = WebDriverWait(driver, 100)
    
    btn = wait.until(EC.presence_of_element_located(
        (By.ID, 'mainframe.TopFrame.form.divFrame.form.divTop.form.divTop.form.btnM532010000:icontext')))
    btn.click()
    btn = wait.until(EC.presence_of_element_located(
        (By.ID, 'mainframe.TopFrame.form.divFrame.form.divTop.form.divPopupMenuM532010000.form.divMain.form.divMenuM532011100.form.btnMenuM000011122:icontext')))
    btn.click()
    btn = wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, "[id*='form.divWork.form.btnInsert4']")))
    btn.click()

    return driver


def available_space(driver: webdriver.Chrome, t_from: datetime, t_to: datetime) -> Dict[str, List[str]]:
    space_list = []
    wait = WebDriverWait(driver, 100)  
    
    month = driver.find_element(By.CSS_SELECTOR, "[id*='grdCal.head.gridrow_-1.cell_-1_2:text']")
    month = int(month.text[month.text.find('년')+1:month.text.find('월')])
    
    # 해당 월로 캘린더 이동
    if month < t_from.month:
        for _ in range(t_from.month - month):
            btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[id*='form.grdCal.head.gridrow_-1.cell_-1_3']")))
            btn.click()
            # time.sleep(1.5)
    elif month > t_from.month:
        for _ in range(month - t_from.month):
            btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[id*='form.grdCal.head.gridrow_-1.cell_-1_1']")))
            btn.click()
            # time.sleep(1.5)
            
    # 1일 cell 찾기
    for i in range(7):
        day_cell = driver.find_element(By.CSS_SELECTOR, f"[id*='grdCal.body.gridrow_0.cell_0_{i}.subcell_0_{i}_0']")
        if day_cell.text == '1':
            first_day_cell = i
            break
        
    # 해당 날짜 cell 찾기
    [day_row, day_column] = divmod(t_from.day + first_day_cell - 1, 7)
    
    # 건물 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboBuildCd.dropbutton']")))
    btn.click()
    
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='.cboBuildCd.combolist.item_7']")))
    btn.click()
    
    # 시간 cell 범위
    start_cell = 1 + 2*(t_from.hour - 9)
    end_cell = 1 + 2*(t_to.hour - 9) if t_to.minute == 0 else 1 + 2*(t_to.hour - 8)
    
    for i in range(1, 16):
        available = is_available(driver, i, day_row, day_column, start_cell, end_cell)
        if available:
            space_list.append(available)
        
    return {
        "available": len(space_list) > 0,
        "space": space_list
    }

def is_available(driver: webdriver.Chrome, space_num:int, day_row:int, day_column:int, start_cell: int, end_cell: int) -> Union[bool, str]:
    wait = WebDriverWait(driver, 1000) 
    # 공간 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboSpaceCd.dropbutton']")))
    btn.click()
    
    space_name = driver.find_element(By.CSS_SELECTOR, f"[id*='.cboSpaceCd.combolist.item_{space_num}:text']")
    space_name = space_name.text
    
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboSpaceCd.combolist.item_{space_num}']")))
    btn.click()
    time.sleep(1.5)
    
    
    if space_num != 8:
        btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='.form.divNotice.form.btnClose']")))
        btn.click()
    
    # 날짜 선택
    btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, f"[id*='grdCal.body.gridrow_{day_row}.cell_{day_row}_{day_column}']")))
    btn.click()
    
    # 해당 시간 이용가능 여부 판단
    for i in range(start_cell, end_cell, 2):
        element = driver.find_element(By.CSS_SELECTOR, f"[id*='form.grdMain.body.gridrow_0.cell_0_{i}']")
        if element.get_attribute('innerHTML') != '':
            return False
        
    
    return space_name



def submit_reservation_form(driver: webdriver.Chrome) -> None:
    # 여기서부터 추가
    pass


def argparsing() -> argparse.Namespace:
    """_summary_
    crawling에 필요한 정보 입력받고 파싱
    Returns:
        argparse.Namespace: {
            user_id: str,
            user_pwd: str,
            start_t: str, 
            end_t: str,
            find_space: bool,
            submit: bool
        }
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--user_id', '-i', type=str, required=False, help='사용자 ID')
    parser.add_argument('--user_pwd', '-p', type=str, required=False, help='사용자 비밀번호')
    parser.add_argument('--start_t', '-s', type=int, required=False, help='예약 시작 시간')
    parser.add_argument('--end_t', '-e', type=int, required=False, help='예약 종료 시간')
    parser.add_argument('--find_space', '-F', action='store_true', help='예약가능 공간 출력')
    parser.add_argument('--submit', '-S', action='store_true', help='공간예약형식 제출')
    

    args = parser.parse_args()
    return args


def main():
    args = argparsing()
    driver = init_driver()
    
    login_skku(driver, args.user_id, args.user_pwd ) #"id", "pswd")
    enter_gls(driver)
    open_reservation_popup(driver)
    
    if args.find_space:    
        space_list = available_space(driver,
            datetime.strptime("2023-05-24 12:00", "%Y-%m-%d %H:%M"),
            datetime.strptime("2023-05-24 13:00", "%Y-%m-%d %H:%M")
        ) #datetime.fromtimestamp(args.start_t/1000), datetime.fromtimestamp(args.end_t/1000))
        
        
        driver.quit()
        print(space_list)
        return
    
    if args.submit:
        submit_reservation_form(driver)
        driver.quit()
        return
    
    driver.quit()
    return

if __name__ == "__main__":
    main()
