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
import re

# Chrome WebDriver 경로 설정 (본인의 환경에 맞게 수정)
WEBDRIVER_PATH = './chromedriver'
SERVICE = Service(WEBDRIVER_PATH)
OPTIONS = webdriver.ChromeOptions()  # 브라우저 창 최대화
OPTIONS.add_argument('--start-maximized')
OPTIONS.add_argument("--window-size=1920,1080")
OPTIONS.add_argument('--headless')
OPTIONS.add_argument('--no-sandbox')
OPTIONS.add_argument('--disable-dev-shm-usage')

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

    wait = WebDriverWait(driver, 10)
    user_id_input = wait.until(EC.presence_of_element_located(
        (By.ID, 'userid')))
    user_pwd_input = wait.until(EC.presence_of_element_located(
        (By.ID, 'userpwd')))

    user_id_input.send_keys(user_id)
    user_pwd_input.send_keys(user_pwd)

    user_pwd_input.send_keys(Keys.RETURN)

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
    wait = WebDriverWait(driver, 10)
    
    user_name = wait.until(EC.presence_of_element_located(
        (By.CLASS_NAME, 'userInfo')))
    print(user_name.get_attribute('innerText'))
    element = wait.until(EC.presence_of_element_located(
        (By.XPATH, '//a[@title="GLS"]')))
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
    wait = WebDriverWait(driver, 10)
    user_name = wait.until(EC.presence_of_element_located(
        (By.ID, 'mainframe.TopFrame.form.divFrame.form.divTop.form.divTop.form.staUserInfo:text')))
    print(user_name.get_attribute('innerText'))
    btn = wait.until(EC.presence_of_element_located(
        (By.XPATH, '//*[@id="mainframe.TopFrame.form.divFrame.form.divTop.form.divTop.form.btnM532010000:icontext"]')))
    btn.click()
    print("butn find")
    btn = wait.until(EC.presence_of_element_located(
        (By.XPATH, '//*[@id="mainframe.TopFrame.form.divFrame.form.divTop.form.divPopupMenuM532010000.form.divMain.form.divMenuM532011100.form.btnMenuM000011122:icontext"]')))
    btn.click()
    btn = wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, "[id*='form.divWork.form.btnInsert4']")))
    btn.click()

    return driver


def available_space(driver: webdriver.Chrome, t_from: datetime, t_to: datetime) -> Dict[str, List[str]]:
    space_list = []
    space_num_list = []
    building_num = 7
    
    wait = WebDriverWait(driver, 10)  
    
    month = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='grdCal.head.gridrow_-1.cell_-1_2:text']")))
    pattern = r"\d+"
    matches = re.findall(pattern, month.text)
    month = int(matches[1])
    print(month)
    
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
        day_cell = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='grdCal.body.gridrow_0.cell_0_{i}.subcell_0_{i}_0']")))
        if day_cell.text == '1':
            first_day_cell = i
            break
        
    # 해당 날짜 cell 찾기
    [day_row, day_column] = divmod(t_from.day + first_day_cell - 1, 7)
    
    # 건물 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboBuildCd.dropbutton']")))
    btn.click()
    
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboBuildCd.combolist.item_{building_num}']")))
    btn.click()
    
    # 시간 cell 범위
    start_cell = 1 + 2*(t_from.hour - 9)
    end_cell = 1 + 2*(t_to.hour - 9) if t_to.minute == 0 else 1 + 2*(t_to.hour - 8)
    
    for i in range(1, 16):
        available = is_available(driver, i, day_row, day_column, start_cell, end_cell)
        if available:
            space_list.append(available)
            space_num_list.append(i)
        
    return {
        "available": len(space_list) > 0,
        "space": space_list,
        "space_num": space_num_list,
        "building_num": building_num
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
        element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='form.grdMain.body.gridrow_0.cell_0_{i}']")))
        if element.get_attribute('innerHTML') != '':
            return False
        
    
    return space_name



def submit_reservation_form(driver: webdriver.Chrome, Event_num:int, Team_name:str, Event_name: str, Member_num: int, Building_num: int, space_num:int, t_from: datetime, t_to: datetime) -> None:
    """_summary_
    공간대여신청 (예약신청) 팝업창 열기
    Args:
        driver (webdriver.Chrome): _description_
        Event_num: 행사구분 번호, {1: 보충수업특강시험, 2:학생회동아리, 3:세미나스터디, 4:본부부서 주관행사
        5: 단과대학 주관행사, 6:학과 주관행사, 7:교외 단체행사, 8:기타}
        Team_name: 주관단체
        Event_name: 행사명
        Member_num: 행사인원 (space의 최대 수용 가능 인원 내의 범위)
        Building_num: 건물번호 (space정보에서 추출)
        space_num: 공간 번호
        예약기간, 예약시간
        
        
    Returns:
        webdriver.Chrome: _description_
    """
    
    #필요 정보: 행사구분 번호(int), 주관단체(str), 행사명(str), 행사인원(str), 건물번호(int)
    #예약기간, 예약 시간
    wait = WebDriverWait(driver, 10)
    
    #행사구분 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboHangsaGb.dropbutton']")))
    btn.click()
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboHangsaGb.combolist.item_{Event_num}:text']")))
    btn.click()
    
    #주관단체 입력
    input = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "[id*='edtSinchungGroup:input']")))
    input.click()
    input.send_keys(Team_name)
    
    #행사명 입력
    input = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "[id*='edtSinchungEvent:input']")))
    input.click()
    input.send_keys(Event_name)
    
    #인원 수 입력
    input = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "[id*='edtUseNum:input']")))
    input.click()
    input.send_keys(Member_num)
    
    
    #건물 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboBuildCd.dropbutton']")))
    btn.click()
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboBuildCd.combolist.item_{Building_num}']")))
    btn.click()
    
    #공간 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboSpaceCd.dropbutton']")))
    btn.click()
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboSpaceCd.combolist.item_{space_num}:text']")))
    btn.click()
    
    #날짜 선택
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='calUseDt.dropbutton']")))
    btn.click()
    
    month = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='calUseDt.datepicker.head.monthstatic:text']")))
    month = int(month.text)
    print(month)
    
    # 해당 월로 캘린더 이동
    if month < t_from.month:
        for _ in range(t_from.month - month):
            btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[id*='form.calUseDt.datepicker.head.nextbutton']")))
            btn.click()
            # time.sleep(1.5)
    elif month > t_from.month:
        for _ in range(month - t_from.month):
            btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[id*='form.calUseDt.datepicker.head.prevbutton']")))
            btn.click()
            # time.sleep(1.5)
            
    # 1일 cell 찾기
    for i in range(7):
        day_cell = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='form.calUseDt.datepicker.body.dayitem{i}']")))
        if day_cell.text == '1':
            first_day_cell = i
            break
        
    # 해당 날짜 cell 찾기
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='form.calUseDt.datepicker.body.dayitem{t_from.day + first_day_cell - 1}']")))
    btn.click()
    
    #시간 선택
    start_cell = 2*(t_from.hour - 9)
    if t_from.minute > 0:
        start_cell = start_cell + 1
    
    end_cell = 2*(t_to.hour - 9)
    if t_to.minute > 0:
        end_cell = end_cell + 1
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboResStTime.dropbutton']")))
    btn.click()
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboResStTime.combolist.item_{start_cell}']")))
    btn.click()
    
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='cboResEdTime.dropbutton']")))
    btn.click()
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[id*='.cboResEdTime.combolist.item_{end_cell}']")))
    btn.click()
    
    #제출
    btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[id*='form.btnSave']")))
    btn.click()
    
    return driver


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
    #항상 필요
    parser.add_argument('--user_id', '-i', type=str, required=False, help='사용자 ID')
    parser.add_argument('--user_pwd', '-p', type=str, required=False, help='사용자 비밀번호')
    parser.add_argument('--start_t', '-s', type=str, required=False, help='예약 시작 시간')
    parser.add_argument('--end_t', '-e', type=str, required=False, help='예약 종료 시간')
    parser.add_argument('--find_space', '-F', action='store_true', help='예약가능 공간 출력')
    parser.add_argument('--submit', '-S', action='store_true', help='공간예약형식 제출')
    

    args = parser.parse_args()
    return args


def main():
    args = argparsing()
    driver = init_driver()
    
    login_skku(driver, args.user_id, args.user_pwd ) #"id", "pswd")

    enter_gls(driver)
    print("gls 진입 성공")
    open_reservation_popup(driver)
    print("공간예약 팝업 진입 성공")
    
    if args.find_space:    
        space_list = available_space(driver,
            datetime.strptime("2023-05-24 12:00", "%Y-%m-%d %H:%M"),
            datetime.strptime("2023-05-24 13:00", "%Y-%m-%d %H:%M")
        ) #datetime.fromtimestamp(args.start_t/1000), datetime.fromtimestamp(args.end_t/1000))
        
        driver.quit()
        print(space_list)
        return
    
    
    dummy_space_list = {'available': True, 
                        'space': ['[26119B] Graduate Student Seminar Room 2 / 5 people ~ 16 people', '[26314B] Seminar Room for School of Information and Communi / 8 people ~ 27 people', '[26502] Lecture Room / 20 people ~ 65 people'], 
                        'space_num': [4, 12, 13], 
                        'building_num': 7}
    if args.submit:
        submit_reservation_form(driver,
            2,"소공개4팀","프로젝트 정기회의","6",
            dummy_space_list['building_num'],
            dummy_space_list['space_num'][0]
            ,datetime.strptime("2023-05-24 12:00", "%Y-%m-%d %H:%M"),
            datetime.strptime("2023-05-24 13:00", "%Y-%m-%d %H:%M")
        )
        driver.quit()
        return
    
    driver.quit()
    return

if __name__ == "__main__":
    main()
