const connectToDatabase = require("../../db/connection");

const agentServices = {}





agentServices.verifyStaff = async (connection, email) => {
    return connection.execute(`SELECT ms.*, msr.name as role FROM midoffice_staff ms inner join midoffice_staff_roles msr on ms.roleId=msr.id WHERE ms.email='${email}'`);
}
agentServices.checkRoleName=(connection,RoleName)=>{
    return connection.execute(`select * from midoffice_staff_roles where name='${RoleName}'`);
}
agentServices.addNewRoles = (connection, RoleName, Description, createdBy, createdAt) => {
    return connection.execute('insert into midoffice_staff_roles(name, description, createdBy, createdAt) values(?,?,?,?)',
        [RoleName, Description, createdBy, createdAt])
}
agentServices.updateNewRoles = (connection, RoleName, Description, createdBy, createdAt) => {
    return connection.execute(`update midoffice_staff_roles set description='${Description}', status=1 ,createdBy='${createdBy}',createdAt='${createdAt}' where name='${RoleName}'`);
}
agentServices.readRoles=(connection)=>{
    return connection.execute('select id, name, description, status, createdBy, DATE_FORMAT(createdAt, "%d-%m-%Y %H:%i:%s") as createdAt, updatedBy, DATE_FORMAT(updatedAt, "%d-%m-%Y %H:%i:%s") as updatedAt from midoffice_staff_roles where status="1" ');
}
agentServices.updateRoles=(connection,id,RoleName,Description, updatedBy,updatedAt)=>{
    return connection.execute(`update midoffice_staff_roles set name='${RoleName}', description='${Description}',updatedBy='${updatedBy}',updatedAt='${updatedAt}' where id=${id}`);
}

agentServices.checkRole=(connection,id)=>{
    return connection.execute(`select * from midoffice_staff where roleId=${id}`);
}

agentServices.deleteRoles=(connection,id)=>{
    return connection.execute(`update midoffice_staff_roles set status="0" where id=${id}`);
}

agentServices.readAgents=(connection)=>{
    return connection.execute('select * from agents');
}

agentServices.readAgentByID=(connection, id)=>{
    return connection.execute('select * from agents where id=?', [id]);
}

agentServices.readAgent=(connection, id)=>{
    return connection.execute(`select id,establishment_name, company_trade_license, company_trade_license_path,address, nature_of_business, area, emirates, email, mobile, director1_name, director1_nationality, director1_passport_issuing_country, director1_passport_number,DATE_FORMAT(director1_passport_expiry, "%d-%m-%Y") as director1_passport_expiry, director1_emirates_id,DATE_FORMAT(director1_emirates_id_expiry, "%d-%m-%Y") as director1_emirates_id_expiry, director1_email, director1_mobile,director1_emirates_id_path,director1_emirates_passport_path, director2_name, director2_nationality, director2_passport_issuing_country, director2_passport_number,DATE_FORMAT(director2_passport_expiry, "%d-%m-%Y") as director2_passport_expiry, director2_emirates_id,DATE_FORMAT(director2_emirates_id_expiry, "%d-%m-%Y") as director2_emirates_id_expiry, director2_email, director2_mobile,director2_emirates_id_path,director2_emirates_passport_path, authorized_person_name, authorized_person_nationality, authorized_person_passport_issuing_country, authorized_person_passport_number,DATE_FORMAT(authorized_person_passport_expiry, "%d-%m-%Y") as authorized_person_passport_expiry, authorized_person_emirates_id,DATE_FORMAT(authorized_person_emirates_id_expiry, "%d-%m-%Y") as authorized_person_emirates_id_expiry, authorized_person_email, authorized_person_mobile,authorized_person_emirates_id_path,authorized_person_emirates_passport_path, banker_name, branch_location, account_number, current_business_volume, iata_accredited, iata_document_path, email_for_invoice, assisted_by, assisted_by_details,staff_email,staff_mobile,status, createdOn, createdBy from agents where id=${id}`);
}
agentServices.addUserGroup = (connection, GroupName, Description, createdDate, createdBy, updatedDate, UpdatedBy) => {
    return connection.execute('insert into user_group(name, description, createdDate, createdBy, updatedDate, updatedBy) values(?,?,?,?,?,?)',
        [GroupName, Description, createdDate, createdBy, updatedDate, UpdatedBy])
}
agentServices.readUserGroup=(connection)=>{
    return connection.execute('select id, name, description, DATE_FORMAT(createdDate, "%d-%m-%Y %H:%i:%s") as createdDate, createdBy, DATE_FORMAT(updatedDate, "%d-%m-%Y %H:%i:%s") as updatedDate, updatedBy from user_group order by id desc');
}
agentServices.updateUserGroup=(connection,id,GroupName,Description, updatedDate,updatedBy)=>{
    return connection.execute(`update user_group set name='${GroupName}', description='${Description}',updatedDate='${updatedDate}',updatedBy='${updatedBy}' where id=${id}`);
}
agentServices.deleteUserGroup=(connection,id)=>{
    return connection.execute(`delete from user_group where id=${id}`);
}

agentServices.activateWithPassword = (connection, password, id) => {
    const status = 1
    // return connection.execute("update agents set password=? and status=? where id=?", [password, status, id]);
    return connection.execute(`update agents set password="${password}" , status="${status}" , flag='1' where id=${id}`);
}

agentServices.activateAgent = (connection, id) => {
    const status = 1
    return connection.execute("update agents set status=? where id=?", [status, id]);
}

agentServices.deactivateAgent = (connection, id) => {
    const status = 0
    return connection.execute("update agents set status=? where id=?", [status, id]);
}

agentServices.addFlightCommercial = (connection, product, vendor, booking_type, airline, fare_type, markup_type, group_type, markup_percentage, markup_plb) => {
    return connection.execute(`insert into flight_commercials(product, booking_type, fare_type, airline, markup_type, markup_plb, markup_percentage, group_type,vendor) Values('${product}','${booking_type}','${fare_type}','${airline}','${markup_type}','${markup_plb}','${markup_percentage}','${group_type}','${vendor}')`);
}

agentServices.FetchCommercials = (connection) => {
    return connection.execute(`
        SELECT 
            flight_commercials.id,
            flight_commercials.product,
            flight_commercials.vendor,
            flight_commercials.markup_type,
            flight_commercials.markup_plb,
            flight_commercials.markup_percentage,
            flight_commercials.group_type,
            flight_commercials.booking_type,
            flight_commercials.fare_type,
            flight_commercials.airline,
            user_group.name AS group_name,
            CASE 
                WHEN flight_commercials.airline = 'All' THEN 'All'
                ELSE airlines.Name 
            END AS carriers,
            CASE 
                WHEN flight_commercials.fare_type = 'All' THEN 'All'
                ELSE fare.fare 
            END AS fare
        FROM 
            flight_commercials
        LEFT JOIN 
            fare 
            ON flight_commercials.fare_type = fare.id 
            AND flight_commercials.fare_type != 'All'
        LEFT JOIN 
            airlines 
            ON flight_commercials.airline = airlines.AirlineIndex 
            AND flight_commercials.airline != 'All'
        JOIN
            user_group 
            ON flight_commercials.group_type = user_group.id;
    `);
};

agentServices.editFlightCommercial = (connection, product, vendor, booking_type, airline, fare_type, markup_type, group_type, markup_percentage, markup_plb, id) => {
    return connection.execute(
        `UPDATE flight_commercials 
    SET 
        product = ?, 
        booking_type = ?, 
        fare_type = ?, 
        airline = ?, 
        markup_type = ?, 
        markup_plb = ?, 
        markup_percentage = ?, 
        group_type = ?, 
        vendor = ? 
    WHERE id = ?`,
        [product, booking_type, fare_type, airline, markup_type, markup_plb, markup_percentage, group_type, vendor, id]
    );
}

agentServices.deleteCommercial = (connection, id) => {
    return connection.execute(`delete from flight_commercials where id = '${id}'`)
}
// ------------------------------------------------------------------------------------------------------------------

agentServices.readStaff=(connection,staffId)=>{
    return connection.execute(`SELECT ms.id,ms.first_name,ms.last_name,ms.email,ms.mobile,ms.status, msr.name as role FROM midoffice_staff ms inner join midoffice_staff_roles msr on ms.roleId=msr.id where ms.id != ${staffId} `)
}
agentServices.checkStaffEmail=(connection,email)=>{
    return connection.execute(`select * from midoffice_staff where email='${email}'`);
}
agentServices.checkStaffMobile=(connection,mobile)=>{
    return connection.execute(`select * from midoffice_staff where mobile='${mobile}'`);
}

agentServices.addStaff = (connection, firstName, lastName, email, mobile, hashPassword, createdAt,createdBy,role) => {
    return connection.execute('insert into midoffice_staff(first_name, last_name, email, mobile, password, status, createdBy, createdAt, roleId) values(?,?,?,?,?,?,?,?,?)',
        [firstName, lastName, email, mobile, hashPassword, 1, createdBy,createdAt,role])
}
agentServices.getStaffId=(connection,email,mobile)=>{
    return connection.execute(`select id from midoffice_staff where email='${email}' and mobile='${mobile}'`);
}
agentServices.activeStaff=(connection,id)=>{
    return connection.execute(`update midoffice_staff set status='1' where id=${id}`);
}
agentServices.checkStaff=(connection,id)=>{
    return connection.execute(`select * from agents where staff_mapped=${id}`);
}
agentServices.inactiveStaff=(connection,id)=>{
    return connection.execute(`update midoffice_staff set status='0' where id=${id}`);
}

agentServices.checkOldPassword=(connection,staffId)=>{
    return connection.execute(`select * from midoffice_staff where id=${staffId}`);
}
agentServices.updatePassword=(connection,staffId,hashPassword)=>{
    return connection.execute(`update midoffice_staff set password='${hashPassword}' where id=${staffId}`);
}
agentServices.updateResendPassword=(connection,hashPassword,id)=>{
    return connection.execute(`update agents set password='${hashPassword}',flag='0' where id=${id}`);
}

agentServices.staffDetails=(connection,staffId)=>{
    return connection.execute(`SELECT ms.first_name,ms.last_name, msr.name as role FROM midoffice_staff ms inner join midoffice_staff_roles msr on ms.roleId=msr.id where ms.id=${staffId}`);
}
agentServices.checkProduct=(connection,product)=>{
    return connection.execute(`select * from platform_fee where product='${product}'`);
}
agentServices.addProduct=(connection,product,fee,tax)=>{
    return connection.execute(`insert into platform_fee(product, fees, tax) Values('${product}',${fee},${tax})`);
}
agentServices.updateProduct=(connection,product_id,fee,tax)=>{
    return connection.execute(`update platform_fee set fees=${fee}, tax=${tax} where id='${product_id}'`);
}
agentServices.readPlatformFee=(connection)=>{
    return connection.execute(`select * from platform_fee`);
}

agentServices.addFare=(connection,fareType)=>{
    return connection.execute(`insert into fare(fare) Values('${fareType}')`);
}

agentServices.addAirport=(connection,airport_Name,airport_Code,city_Code,city_Name,country_Code,country_Name)=>{
    return connection.execute(`insert into airport(AirportName,AirportCode,CityName,CityCode,CountryCode,CountryName) Values('${airport_Name}','${airport_Code}','${city_Name}','${city_Code}','${country_Code}','${country_Name}')`);
}
agentServices.addAirline=(connection,AirlineName,AirlineCode)=>{
    return connection.execute(`insert into airlines(Name,Code) Values('${AirlineName}','${AirlineCode}')`);
}
agentServices.getFareData=(connection)=>{
    return connection.execute(`select * from fare`);
}
agentServices.getAirportData=(connection)=>{
    return connection.execute(`select * from airport order by airport.AirportIndex DESC`);
}
agentServices.getAirlineData=(connection)=>{
    return connection.execute(`select * from airlines order by airlines.AirlineIndex DESC`);
}
agentServices.updateFare=(connection,fareType,fare_id)=>{
    return connection.execute(`update fare set fare='${fareType}' where id=${fare_id}`);
}
agentServices.updateAirport=(connection,airportName,airportCode,cityCode,cityName,countryCode,countryName,airport_id)=>{
    return connection.execute(`update airport set AirportName='${airportName}',AirportCode='${airportCode}',CityName='${cityName}',CityCode='${cityCode}',CountryCode='${countryCode}',CountryName='${countryName}' where AirportIndex=${airport_id}`);
}
agentServices.updateAirline=(connection,AirlineName,AirlineCode,Airline_id)=>{
    return connection.execute(`update airlines set Name='${AirlineName}',Code='${AirlineCode}' where AirlineIndex=${Airline_id}`);
}
agentServices.checkFare=(connection,id)=>{
    return connection.execute(`SELECT * FROM flight_markup WHERE fare_types = ${id} OR fare_types = 'all'`);
}
agentServices.deleteFare=(connection,id)=>{
    return connection.execute(`delete from fare where id=${id}`);
}

agentServices.deleteAirport=(connection,id)=>{
    return connection.execute(`delete from airport where AirportIndex=${id}`);
}

agentServices.deleteAirline=(connection,id)=>{
    return connection.execute(`delete from airlines where AirlineIndex=${id}`);
}

agentServices.addSupplier=(connection,supplier)=>{
    return connection.execute(`insert into supplier(supplier) Values('${supplier}')`);
}
agentServices.getSupplierData=(connection)=>{
    return connection.execute(`select * from supplier`);
}
agentServices.updateSupplier=(connection,supplier,supplier_id)=>{
    return connection.execute(`update supplier set supplier='${supplier}' where id=${supplier_id}`);
}
agentServices.checkSupplier=(connection,id)=>{
    return connection.execute(`SELECT * FROM flight_markup WHERE suppliers = ${id} OR suppliers = 'all'`);
}
agentServices.deleteSupplier=(connection,id)=>{
    return connection.execute(`delete from supplier where id=${id}`);
}

agentServices.checkPlan=(connection,plan_name)=>{
    return connection.execute(`select * from flight_markup where plan_name='${plan_name}'`);
}
agentServices.addPlan=(connection,plan_name,type,MarkupValue,suppliers,fareTypes,carriers,cancellation,rescheduling)=>{
    return connection.execute(`insert into flight_markup(plan_name, type, value, suppliers, fare_types, carriers, cancellation, rescheduling) Values('${plan_name}','${type}','${MarkupValue}','${suppliers}','${fareTypes}','${carriers}','${cancellation}','${rescheduling}')`);
}
agentServices.checkPlanName=(connection,id)=>{
    return connection.execute(`select plan_name from flight_markup where id='${id}'`);
}
agentServices.deleteMarkup=(connection,plan)=>{
    return connection.execute(`delete from flight_markup where plan_name='${plan}'`);
}
agentServices.getMarkupData=(connection)=>{
    return connection.execute(`SELECT 
    MIN(id) AS id, 
    plan_name, 
    type, 
    value, 
    cancellation, 
    rescheduling
FROM 
    flight_markup
GROUP BY 
    plan_name, 
    type, 
    value, 
    cancellation, 
    rescheduling;
`);
}
agentServices.getData=(connection,plan_name)=> {
    return connection.execute(`SELECT 
    CASE 
        WHEN flight_markup.carriers = 'all' THEN 'All'
        ELSE airlines.Name 
    END AS carriers,
    CASE 
        WHEN flight_markup.suppliers = 'all' THEN 'All'
        ELSE supplier.supplier 
    END AS supplier, 
    CASE 
        WHEN flight_markup.fare_types = 'all' THEN 'All'
        ELSE fare.fare 
    END AS fare 
FROM 
    flight_markup 
LEFT JOIN 
    supplier ON flight_markup.suppliers = supplier.id AND flight_markup.suppliers != 'all'
LEFT JOIN 
    fare ON flight_markup.fare_types = fare.id AND flight_markup.fare_types != 'all'
LEFT JOIN 
    airlines ON flight_markup.carriers = airlines.AirlineIndex AND flight_markup.carriers != 'all'
WHERE 
    plan_name = '${plan_name}'
`);
}

agentServices.getStaffCount=(connection)=>{
    return connection.execute(`select count(*) as users from midoffice_staff`);
}
agentServices.getAgentCount=(connection)=>{
    return connection.execute(`select count(*) as partners from agents`);
}
agentServices.getPendingRequestCount=(connection)=>{
    return connection.execute(`select count(*) as pendingRequest from agent_wallet_request where status=0`);
}
agentServices.getFlightSearchCount=(connection)=>{
    return connection.execute(`select count(*) as flightSearchCount from flight_search_log`);
}
agentServices.getFlightBookCount=(connection)=>{
    return connection.execute(`select count(*) as flightBookCount from new_flight_booking`);
}
agentServices.getTotalFlightRevenue=(connection)=>{
    return connection.execute(`SELECT SUM(customer_amount) AS totalFlightRevenue
FROM new_flight_booking`);
}
agentServices.getCarrierData=(connection)=>{
    return connection.execute(`select * from airlines`);
}

agentServices.checkEmail = (connection,semail,status,remarks,time,client_ip) => {
    return connection.execute(`insert into staff_log(email, status, Remarks, time,client_ip) values('${semail}','${status}','${remarks}','${time}','${client_ip}')`)
}
agentServices.accountNotActive = (connection,sname,semail,status,remarks,time,client_ip) => {
    return connection.execute(`insert into staff_log(name,email, status, Remarks, time,client_ip) values('${sname}','${semail}','${status}','${remarks}','${time}','${client_ip}')`)
}
agentServices.invalidPassword = (connection,sname,semail,status,remarks,time,client_ip) => {
    return connection.execute(`insert into staff_log(name,email, status, Remarks, time,client_ip) values('${sname}','${semail}','${status}','${remarks}','${time}','${client_ip}')`)
}
agentServices.loginSuccess = (connection,sname,semail,status,remarks,time,client_ip) => {
    return connection.execute(`insert into staff_log(name,email, status, Remarks, time,client_ip) values('${sname}','${semail}','${status}','${remarks}','${time}','${client_ip}')`)
}
agentServices.logout = (connection,sname,semail,status,remarks,time,client_ip) => {
    return connection.execute(`insert into staff_log(name,email, status, Remarks, time,client_ip) values('${sname}','${semail}','${status}','${remarks}','${time}','${client_ip}')`)
}
agentServices.getStaffLogData = (connection) => {
    return connection.execute(`select id, name, email, status, Remarks,DATE_FORMAT(time, "%d-%m-%Y %H:%i:%s") as  time,client_ip from staff_log ORDER BY id DESC`)
}
agentServices.getAgentLogData = (connection) => {
    return connection.execute(`select id, name, email, status, remarks,DATE_FORMAT(time, "%d-%m-%Y %H:%i:%s") as  time,client_ip from agent_log ORDER BY id DESC`)
}
agentServices.updateEstablishmentDetails=(connection,nature_of_business,establishment_name,address,area,emirates,email,mobile,id)=>{
    return connection.execute(`update agents set establishment_name='${establishment_name}', address='${address}', nature_of_business='${nature_of_business}', area='${area}',emirates='${emirates}', email='${email}', mobile='${mobile}' where id=${id}`);
}
agentServices.updateDirector1Details=(connection,name, nationality,passportNumber,passportIssuingCountry,passportExpiry,emiratesId,emiratesIdExpiry,email1,mobile1,id)=>{
    return connection.execute(`update agents set director1_name='${name}', director1_nationality='${nationality}', director1_passport_number='${passportNumber}', director1_passport_issuing_country='${passportIssuingCountry}',director1_passport_expiry='${passportExpiry}', director1_emirates_id='${emiratesId}', director1_emirates_id_expiry='${emiratesIdExpiry}',director1_email='${email1}',director1_mobile='${mobile1}' where id=${id}`);
}
agentServices.updateDirector2Details=(connection,name2, nationality2,passportNumber2,passportIssuingCountry2,passportExpiry2,emiratesId2,emiratesIdExpiry2,email2,mobile2,id)=>{
    return connection.execute(`update agents set director2_name='${name2}', director2_nationality='${nationality2}', director2_passport_number='${passportNumber2}', director2_passport_issuing_country='${passportIssuingCountry2}',director2_passport_expiry='${passportExpiry2}', director2_emirates_id='${emiratesId2}', director2_emirates_id_expiry='${emiratesIdExpiry2}',director2_email='${email2}',director2_mobile='${mobile2}' where id=${id}`);
}
agentServices.updateSignatoryDetails=(connection,authorized_person_name,authorized_person_nationality,authorized_person_passport_number,authorized_person_passport_issuing_country,authorized_person_passport_expiry,authorized_person_emirates_id,authorized_person_emirates_id_expiry,authorized_person_email,authorized_person_mobile,id)=>{
    return connection.execute(`update agents set authorized_person_name='${authorized_person_name}', authorized_person_nationality='${authorized_person_nationality}', authorized_person_passport_number='${authorized_person_passport_number}', authorized_person_passport_issuing_country='${authorized_person_passport_issuing_country}',authorized_person_passport_expiry='${authorized_person_passport_expiry}', authorized_person_emirates_id='${authorized_person_emirates_id}', authorized_person_emirates_id_expiry='${authorized_person_emirates_id_expiry}',authorized_person_email='${authorized_person_email}',authorized_person_mobile='${authorized_person_mobile}' where id=${id}`);
}
agentServices.updateBankDetails=(connection,banker_name,branch_location,account_number,current_business_volume,id)=>{
    return connection.execute(`update agents set banker_name='${banker_name}',branch_location='${branch_location}',account_number='${account_number}',current_business_volume='${current_business_volume}' where id=${id}`);
}
agentServices.insertDetails=(connection,id,time,staffName,old_values,new_values)=>{
    return connection.execute(`insert into agent_profile_history(agent_id, updated_on, updated_by, old_values, new_values)Values(${id},'${time}','${staffName}','${old_values}','${new_values}')`);
}
agentServices.getIataDocument=(connection,id)=>{
    return connection.execute(`select iata_accredited as iata from agents where id=${id}`);
}
agentServices.getDocument=(connection,FileType,id)=>{
    return connection.execute(`select ${FileType} as file from agents where id=${id}`);
}
agentServices.updateDocument=(connection,fileType,DBPath,Id)=>{
    return connection.execute(`update agents set ${fileType}='${DBPath}' where id=${Id}`);
}
agentServices.insertDocument=(connection,Id,fileType,document,time,staffName,remarks)=>{
    return connection.execute(`insert into agent_document_history(agentId, document_type, document_path,updated_on,updated_by, remarks)Values(${Id},'${fileType}','${document}','${time}','${staffName}','${remarks}')`);
}
agentServices.suspendAgent = (connection, id) => {
    const status = 2
    return connection.execute("update agents set status=? where id=?", [status, id]);
}
agentServices.readSalesStaff=(connection)=>{
    return connection.execute(`SELECT ms.id as id, ms.first_name,ms.last_name, msr.name as role FROM midoffice_staff ms inner join midoffice_staff_roles msr on ms.roleId=msr.id WHERE msr.name='Sales'`);
}

agentServices.salesMapping = (connection, SalesPerson,remarks,id) => {
    return connection.execute(`update agents set staff_mapped=${SalesPerson},remarks='${remarks}' where id=${id}`);
}
agentServices.getSalesDetails = (connection, SalesPerson) => {
    return connection.execute(`select first_name,last_name,id,email,mobile from midoffice_staff where id=${SalesPerson}`);
}
agentServices.updateStaffDetails = (connection,name,staffId,id,email,mobile) => {
    return connection.execute(`update agents set assisted_by='${name}',assisted_by_details='${staffId}',staff_email='${email}',staff_mobile='${mobile}' where id=${id}`);
}
agentServices.readActiveAgents = (connection) => {
    return connection.execute(`select id,email establishment_name from agents where status='1'`);
}
agentServices.countSearch = (connection,id) => {
    return connection.execute(`select count(*) as search_count from flight_search_log where agent_id='${id}'`);
}
agentServices.countBook = (connection,id) => {
    return connection.execute(`select count(*) as book_count from new_flight_booking where agent_email='${id}'`);
}
agentServices.detailsLogs = (connection) => {
    return connection.execute(`SELECT aph.*, agents.establishment_name FROM agent_profile_history aph inner join agents  on aph.agent_id=agents.id`);
}
agentServices.documentLogs = (connection) => {
    return connection.execute(`SELECT adh.*, agents.establishment_name FROM agent_document_history adh inner join agents  on adh.agentId=agents.id`);
}
agentServices.mappedAgentsData = (connection,id) => {
    return connection.execute(`SELECT id,establishment_name,email,mobile,assisted_by from agents where staff_mapped=${id}`);
}

agentServices.allAgentName=(connection)=>{
    return connection.execute(`select id,establishment_name from agents`);
}
agentServices.getAgentDetails=(connection,id)=>{
    return connection.execute(`select id,establishment_name,email,mobile from agents where id=${id}`);
}
agentServices.getWalletId=(connection,id)=>{
    return connection.execute(`select id from prepaid_wallet where agent_id=${id}`);
}
agentServices.checkDetails=(connection,id)=>{
    return connection.execute(`select * from prepaid_wallet_details where walletId=${id}`);
}
agentServices.checkCreditAmount=(connection,id)=>{
    return connection.execute(`SELECT COALESCE(SUM(amount), 0) AS total_credit
FROM prepaid_wallet_details
WHERE transaction_type = 'Credit' and walletId=${id}`);
}
agentServices.checkDebitAmount = (connection, id) => {
    return connection.execute(`
        SELECT COALESCE(SUM(amount), 0) AS total_debit
        FROM prepaid_wallet_details
        WHERE transaction_type IN ('Debit', 'Flight Booked') AND walletId = ${id}
    `);
};
// agentServices.checkDebitAmount=(connection,id)=>{
//     return connection.execute(`SELECT COALESCE(SUM(amount), 0) AS total_debit
// FROM prepaid_wallet_details
// WHERE transaction_type = 'Debit' and walletId=${id}`);
// }
agentServices.addWalletDetails=(connection,walletId,action,amount,remarks,dateTime,Tid,MOT,staffName)=>{
    return connection.execute(`insert into prepaid_wallet_details(walletId, transaction_type, amount, transaction_date_time, remarks,transaction_id,mode_of_payment,done_by) values(${walletId},'${action}',${amount},'${dateTime}','${remarks}','${Tid}','${MOT}','${staffName}')`);
}

agentServices.generalActivityLog=(connection,staffName,staffEmail,description,createdAt,client_ip)=>{
    return connection.execute(`insert into midoffice_general_activity_logs(name, email, description, time,client_ip) values('${staffName}','${staffEmail}','${description}','${createdAt}','${client_ip}')`);
}
agentServices.getActivityLogs=(connection)=>{
    return connection.execute(`select name, email, description, DATE_FORMAT(time, "%d-%m-%Y %H:%i:%s") as time,client_ip from midoffice_general_activity_logs order by id desc`);
}

agentServices.addAgentLog=(connection,staffName,staffEmail,description,createdAt,id,client_ip)=>{
    return connection.execute(`insert into midoffice_agent_activity_log(name, email, description, time,agentId,client_ip) values('${staffName}','${staffEmail}','${description}','${createdAt}',${id},'${client_ip}')`);
}

agentServices.getAgentLogs=(connection)=>{
    return connection.execute(`select ma.name, ma.email, ma.description, DATE_FORMAT(ma.time, "%d-%m-%Y %H:%i:%s") as time,ma.client_ip, agents.email as agentEmail  from midoffice_agent_activity_log ma inner join agents on ma.agentId=agents.id order by ma.id desc`);
}

agentServices.getAgentActivityLogs=(connection)=>{
    return connection.execute(`select al.email, al.remarks, DATE_FORMAT(al.time, "%d-%m-%Y %H:%i:%s") as time,al.client_ip, agents.establishment_name as name  from agent_activity_logs al inner join agents on al.agent_id=agents.id order by al.id desc`);
}
agentServices.getWalletSummary=(connection,id)=>{
    return connection.execute(`select id, walletId, transaction_type, amount,DATE_FORMAT(transaction_date_time, "%d-%m-%Y %H:%i:%s") as transaction_date_time, remarks,transaction_id,mode_of_payment,done_by from prepaid_wallet_details where walletId=${id} order by id desc`);
}
// agentServices.getPendingRequestData=(connection)=>{
//     return connection.execute(`select awr.id,DATE_FORMAT(awr.date_of_deposit, "%d-%m-%Y") as date_of_deposit, awr.amount, awr.mode_of_payment, awr.transaction_id, awr.screenshot,agents.establishment_name,agents.email from agent_wallet_request awr inner join agents on awr.agent_id=agents.id where awr.status=0`);
// }
agentServices.getPendingRequestData=(connection)=>{
    return connection.execute(`select awr.id,DATE_FORMAT(awr.date_of_deposit, "%d-%m-%Y") as date_of_deposit, awr.amount, awr.mode_of_payment, awr.transaction_id, awr.screenshot,agents.establishment_name,agents.email from agent_wallet_request awr inner join agents on awr.agent_id=agents.id where awr.status=0 order by awr.id desc`);
}
// agentServices.approvePendingRequest=(connection,id)=>{
//     return connection.execute(`update agent_wallet_request set status=1 where id=${id}`);
// }
agentServices.approvePendingRequest=(connection,id,remarks_admin,update_by,dateTime)=>{
    return connection.execute(`update agent_wallet_request set status=1,remark_midoffice='${remarks_admin}',updateby='${update_by}',updateon='${dateTime}' where id=${id}`);
}
agentServices.getWalletRequestData=(connection,id)=>{
    return connection.execute(`select agent_id,date_of_deposit,amount,mode_of_payment,transaction_id,remark_midoffice from agent_wallet_request where id=${id}`);
}
agentServices.getAgentEmail=(connection,id)=>{
    return connection.execute(`select email from agents where id=${id}`);
}


agentServices.insertWalletDetails=(connection,id,transaction_type,amount,dateTime,remarks,transaction_id,mode_of_payment,staffName)=>{
    return connection.execute(`insert into prepaid_wallet_details(walletId, transaction_type, amount, transaction_date_time, remarks,transaction_id,mode_of_payment,done_by) values(${id},'${transaction_type}',${amount},'${dateTime}','${remarks}','${transaction_id}','${mode_of_payment}','${staffName}')`);
}

// agentServices.rejectPendingRequest=(connection,id)=>{
//     return connection.execute(`update agent_wallet_request set status=2 where id=${id}`);
// }
agentServices.rejectPendingRequest=(connection,id,remarks_admin,update_by,dateTime)=>{
    return connection.execute(`update agent_wallet_request set status=2,remark_midoffice='${remarks_admin}',updateby='${update_by}',updateon='${dateTime}' where id=${id}`);
}
agentServices.getSearchResults=(connection,id)=>{
    return connection.execute(`select fs.id, fs.agent_id, fs.from, fs.to, fs.total_no_of_pax, fs.no_of_adults, fs.no_of_childs, fs.no_of_infants,DATE_FORMAT(fs.departure_date, "%d-%m-%Y") as departure_date,DATE_FORMAT(fs.return_date, "%d-%m-%Y") as return_date, fs.journey_type, fs.class,DATE_FORMAT(fs.search_date_time, "%d-%m-%Y %H:%i:%s") as search_date_time, agents.establishment_name as name  from flight_search_log fs inner join agents on fs.agent_id=agents.id where agent_id=${id} order by fs.id desc`);
}

agentServices.getFlightBookResults=(connection)=>{
    return connection.execute(`select fb.* , agents.email as email  from flight_booking fb inner join agents on fb.agent_id=agents.id  order by fb.booking_id desc`);
}
agentServices.getFlightBookingDetailResults=(connection,booking_id)=>{
    return connection.execute(`select * from flight_booking_details where booking_id=${booking_id}`);
}

agentServices.CancellationFlights = async (connection) => {
    const [rows] = await connection.execute(`SELECT * FROM new_flight_cancel_queue`);
    return rows; // Only return the rows array
};


agentServices.getFlightCancellationDetails = async (connection, id) => {
    return connection.execute(
        `SELECT fcq.refund_amount AS finalRefundAmt, fcd.*,fcq.*
         FROM new_flight_cancel_queue fcq
         INNER JOIN new_flight_cancel_detail fcd
         ON fcq.cancel_id = fcd.cancel_id
         WHERE fcq.cancel_id = ?`,
        [id]
    );
};

agentServices.updateFlightCancelQueue = async (connection, remarks, cancel_charges, refund_amount, service_charge, cancel_id, vat) => {
    const query = `
        UPDATE new_flight_cancel_queue 
        SET 
            remarks = ?, 
            cancel_charges = ?, 
            refund_amount = ?, 
            service_charge = ?, 
            cancel_status = 'Cancelled', 
            vat = ?
        WHERE cancel_id = ?
    `;

    try {
        const [result] = await connection.execute(query, [
            remarks,
            cancel_charges,
            refund_amount,
            service_charge,
            vat,
            cancel_id
        ]);

        console.log("Update result:", result);
        return result;
    } catch (error) {
        console.error("Error executing updateFlightCancelQueue:", error);
        throw error; // Propagate the error
    }
};
agentServices.updateFlightCancelDetails = async (connection, refund_amount, cancellation_charger, cancel_detail_id) => {
    return connection.execute(
        `UPDATE new_flight_cancel_detail 
         SET refund_amount = ?, cancellation_charge = ? 
         WHERE cancel_detail_id = ?`,
        [refund_amount, cancellation_charger, cancel_detail_id]
    );
};
agentServices.updateFlightPassengersStatusUnderSector = async (connection, booking_id, code) => {
    return connection.execute(
        `UPDATE new_flight_sectors SET cancel_status_code = ? WHERE booking_id = ?`, [code, booking_id]);
};
agentServices.updateFlightPassengersStatusUnderPartial = async (connection, booking_id, code) => {
    return connection.execute(`UPDATE new_flight_passengers SET cancel_status_code = ?  WHERE booking_id = ?`,[code, booking_id]);
};

agentServices.updateFlightPassengersStatusUnderFull = async (connection, booking_id, code) => {
    return connection.execute(
        `UPDATE new_flight_booking 
         SET cancel_status_code = ? 
         WHERE booking_id = ?`,
        [code, booking_id]
    );
};

agentServices.updateFlightCancelStatus = async (connection, cancel_id, remarks) => {
    return connection.execute(
        `UPDATE new_flight_cancel_queue 
         SET remarks = ?, 
             cancel_status = 'Rejected' 
         WHERE cancel_id = ?`,
        [remarks, cancel_id]
    );
};

agentServices.getFlightBookingDetails = async (connection) => {
    return connection.execute(`
        SELECT 
    nfb.*, 
    nfs.origin, 
    nfs.destination, 
    nfs.gdspnr ,
    nfs.departure ,
    nfs.arrival ,
    subuser.firstName AS SubFirstName,
    subuser.lastName AS SubLastName,
    subuser.location AS SubLocation
FROM 
    new_flight_booking nfb
JOIN 
    (
        SELECT 
            booking_id, 
            MIN(origin) AS origin, 
            MIN(destination) AS destination, 
            MIN(gdspnr) AS gdspnr,
            MIN(departure) AS departure,
            MIN(arrival) AS arrival
        FROM 
            new_flight_sectors
        GROUP BY 
            booking_id
    ) nfs 
ON 
    nfb.booking_id = nfs.booking_id 
    
    LEFT JOIN subuser 
    ON nfb.subUser = subuser.email
ORDER BY 
    nfb.booking_id DESC;

    `);
};

agentServices.getHotelBookingDetails = async (connection) => {
    return connection.execute(`
        SELECT hotel_booking.*,hotel_booking_session.roomTravellerInfo from hotel_booking join hotel_booking_session on hotel_booking.api_booking_id=hotel_booking_session.bookingId Order By hotel_booking.id DESC`);
};


agentServices.getFlightBookingDetailsData = async (connection, id) => {
    return connection.execute(`
        SELECT 
    -- Booking Table Fields
    b.booking_id,
    b.booking_date_time,
    b.total_no_of_pax,
    b.total_adult,
    b.total_child,
    b.total_infant,
    b.supplier,
    b.api_source,
    b.api_booking_id,
    b.agent_amount,
    b.customer_amount,
    b.booking_response_json,
    b.ticket_response_json,
    b.agent_email,
    b.company_id,
    b.transaction_id,
    b.payment_type,
    b.trip_type,
    b.platform_fee,
    b.platform_tax,
    b.trace_id,
    b.remarks,
    b.gateway_charges,
    b.ticket_status,
    b.journey,
    b.token_id,
    b.agent_phone_no,
    b.email_id,
    b.mobile_no,
    b.is_domestic,
    b.markup,
    b.agent_markup,
    b.commission,
    b.tds,
    b.total_ssr_amount,
    b.payment_status,
    b.agent_name,

    -- Passenger Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'booking_detail_id', p.booking_detail_id,
                'booking_id', p.booking_id,
                'salutation', p.salutation,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'gender', p.gender,
                'pax_type', p.pax_type,
                'ticket_no', p.ticket_no,
                'date_of_birth', p.date_of_birth,
                'passport_no', p.passport_no,
                'passport_expiry', p.passport_expiry,
                'nationality', p.nationality,
                'booking_status', p.booking_status,
                'ticketing_status', p.ticketing_status,
                'email_id', p.email_id,
                'mobile_no', p.mobile_no,
                'check_in_baggage', p.check_in_baggage,
                'cabin_baggage', p.cabin_baggage,
                'remarks', p.remarks,
                'city', p.city,
                'country_code', p.country_code,
                'address', p.address,
                'wy_tkt_no', p.wy_tkt_no,
                'markup_per_pax', p.markup_per_pax,
                'commission_per_pax', p.commission_per_pax,
                'tds_per_pax', p.tds_per_pax,
                'base_fare', p.base_fare,
                'total_tax', p.total_tax,
                'stops', p.stops,
                'sector_id', p.sector_id,
                'yq_tax', p.yq_tax,
                'yr_tax', p.yr_tax,
                'k3_tax', p.k3_tax,
                'additional_tax', p.additional_tax,
                'published_fare', p.published_fare,
                'service_fee', p.service_fee,
                'other_charges', p.other_charges,
                'transaction_fee', p.transaction_fee,
                'total_ssr_amount', p.total_ssr_amount,
                'cancel_status_code', p.cancel_status_code,
                'ssr_data', (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'ssr_id', ssr.ssr_id,
                                    'ssr_type', ssr.ssr_type,
                                    'description', ssr.description,
                                    'price', ssr.price,
                                    'remarks', ssr.remarks
                                )
                            )
                            FROM new_flight_ssr ssr
                            WHERE ssr.booking_detail_id = p.booking_detail_id
                        )
            )
        )
        FROM new_flight_passengers p
        WHERE p.booking_id = b.booking_id
    ) AS PassengerJson,

    -- Sector Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', s.sector_id,
                'origin', s.origin,
                'destination', s.destination,
                'arrival', s.arrival,
                'duration', s.duration,
                'result_index', s.result_index,
                'departure_terminal', s.departure_terminal,
                'arrival_terminal', s.arrival_terminal,
                'departure_airport_name', s.departure_airport_name,
                'arrival_airport_name', s.arrival_airport_name,
                'arrival_airport_code', s.arrival_airport_code,
                'departure_airport_code', s.departure_airport_code,
                'airline_name', s.airline_name,
                'airline_code', s.airline_code,
                'base_fare', s.base_fare,
                'total_tax', s.total_tax,
                'published_fare', s.published_fare,
                'offered_fare', s.offered_fare,
                'commission', s.commission,
                'tds_on_commission', s.tds_on_commission,
                'yq_tax', s.yq_tax,
                'yr_tax', s.yr_tax,
                'k3_tax', s.k3_tax,
                'additional_taxes', s.additional_taxes,
                'tdo_markup', s.tdo_markup,
                'agent_markup', s.agent_markup,
                'service_fee', s.service_fee,
                'other_charges', s.other_charges,
                'transaction_fee', s.transaction_fee,
                'gdspnr', s.gdspnr,
                'total_ssr_amount', s.total_ssr_amount,
                'departure', s.departure,
                'flight_number', s.flight_number,
                'fare_type', s.fare_type,
                'cancel_status_code', s.cancel_status_code
            )
        )
        FROM new_flight_sectors s
        WHERE s.booking_id = b.booking_id
    ) AS SectorJson,

    -- Segment Data as JSON Array
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'sector_id', seg.sector_id,
                'segment_id', seg.segment_id,
                'origin', seg.origin,
                'destination', seg.destination,
                'departure', seg.departure,
                'arrival', seg.arrival,
                'duration', seg.duration,
                'departure_terminal', seg.departure_terminal,
                'arrival_terminal', seg.arrival_terminal,
                'departure_airport_name', seg.departure_airport_name,
                'arrival_airport_name', seg.arrival_airport_name,
                'arrival_airport_code', seg.arrival_airport_code,
                'departure_airport_code', seg.departure_airport_code,
                'airline_name', seg.airline_name,
                'airline_code', seg.airline_code,
                'flight_number', seg.flight_number,
                'layover_time', seg.layover_time
            )
        )
        FROM new_flight_segments seg
        WHERE seg.booking_id = b.booking_id
    ) AS SegmentJson

FROM 
    new_flight_booking b
WHERE 
    b.booking_id = ?
    `, [id]);
};

agentServices.getHotelBookingDetailsData = async (connection, id) => {
    return connection.execute(`
        SELECT hotel_booking.*,hotel_booking_session.roomTravellerInfo FROM hotel_booking JOIN hotel_booking_session ON hotel_booking.api_booking_id=hotel_booking_session.bookingId WHERE hotel_booking.id = ?`,[id]
)};

agentServices.getHotelGuestDetailsData = async (connection, id) => {
    return connection.execute(`
        SELECT * FROM hotel_bookingdetails WHERE bId = ?`,[id]
    )};


agentServices.UpdateFlightDetails = async (connection,booking_id,agent_email,trip_type,fare_type,agent_phone_number,supplier,airline_name,flight_no) =>{
   return  connection.execute(`
               UPDATE new_flight_booking 
               SET supplier = ? , trip_type = ?  
               WHERE booking_id=?` ,
       [supplier,trip_type,booking_id]
    );
};

agentServices.UpdateHotelDetails = async (connection,booking_id,check_In,check_Out,hotel_name,hotel_address,hotel_phone) =>{
    return  connection.execute(`
               UPDATE hotel_booking 
               SET hotelName = ? , checkIn = ? ,checkOut = ? ,hotel_address = ? ,hotel_phone = ?
               WHERE api_booking_id=?` ,
        [hotel_name,check_In,check_Out, JSON.stringify(hotel_address),hotel_phone,booking_id]
    );
};

agentServices.GetInfo = async (connection,booking_id,bId) =>{
    return  connection.execute(`
              SELECT * from hotel_bookingdetails where bId = ? AND paxType = 'ADULT'`,[bId]
    );
};

agentServices.UpdateGuestInfo = async (connection,booking_id,pt,lN,fN) =>{
    return  connection.execute(`UPDATE hotel_bookingdetails SET salutation = ? , firstName = ? ,lastName = ?,paxType = 'CHILD' WHERE bookingDetailId=?`,
        [pt,fN,lN,booking_id]
    );
};

agentServices.UpdateGuestDetails = async (connection,booking_id,pt,lN,fN) =>{
    return  connection.execute(`UPDATE hotel_bookingdetails SET salutation = ? , firstName = ? ,lastName = ? WHERE bookingDetailId=?`,
        [pt,fN,lN,booking_id]
    );
};

agentServices.UpdatePaxDetails = async (connection,
                                        booking_detail_id,salutation,first_name,last_name,gender,pax_type,ticket_no,date_of_birth,passport_no,
                                        passport_expiry,nationality,passenger_email_id,passenger_mobile_no,check_in_baggage,cabin_baggage,
                                        city,country_code,address,markup_per_pax,commission_per_pax,tds_per_pax,passenger_base_fare,total_tax,stops,
                                        passenger_yq_tax,passenger_yr_tax,passenger_k3_tax,passenger_additional_tax,passenger_published_fare,passenger_service_fee,
                                        passenger_other_charges,passenger_transaction_fee,passenger_total_ssr_amount,pax_id,passenger_remarks,booking_status,
                                        ticketing_status
                                       ) =>{
    console.log({
        booking_detail_id, salutation, first_name, last_name, gender, pax_type, ticket_no, date_of_birth, passport_no,
        passport_expiry, nationality, passenger_email_id, passenger_mobile_no, check_in_baggage, cabin_baggage,
        city, country_code, address, markup_per_pax, commission_per_pax, tds_per_pax, passenger_base_fare, total_tax, stops,
        passenger_yq_tax, passenger_yr_tax, passenger_k3_tax, passenger_additional_tax, passenger_published_fare, passenger_service_fee,
        passenger_other_charges, passenger_transaction_fee, passenger_total_ssr_amount, pax_id, passenger_remarks, booking_status,
        ticketing_status
    });

    return  connection.execute(`
               UPDATE new_flight_passengers
               SET salutation='${salutation}'
        ,first_name='${first_name}'
        ,last_name='${last_name}'
        ,gender='${gender}'
        ,pax_type='${pax_type}'
        ,ticket_no='${ticket_no}'
        ,date_of_birth='${date_of_birth}'
        ,passport_no='${passport_no}'
        ,passport_expiry='${passport_expiry}'
        ,nationality='${nationality}'
        ,email_id='${passenger_email_id}'
        ,mobile_no='${passenger_mobile_no}'
        ,check_in_baggage='${check_in_baggage}'
        ,cabin_baggage='${cabin_baggage}'
        ,remarks='${passenger_remarks}'
        ,city='${city}'
        ,country_code='${country_code}'
        ,address='${address}'
        ,markup_per_pax=${markup_per_pax}
        ,commission_per_pax=${commission_per_pax}
        ,tds_per_pax=${tds_per_pax}
        ,base_fare=${passenger_base_fare}
        ,total_tax=${total_tax}
        ,stops=${stops}
        ,yq_tax=${passenger_yq_tax}
        ,yr_tax=${passenger_yr_tax}
        ,k3_tax=${passenger_k3_tax}
        ,additional_tax=${passenger_additional_tax}
        ,published_fare=${passenger_published_fare}
        ,service_fee=${passenger_service_fee}
        ,other_charges=${passenger_other_charges}
        ,transaction_fee=${passenger_transaction_fee}
        ,total_ssr_amount=${passenger_total_ssr_amount}
        ,booking_status='${booking_status}'
        ,ticketing_status='${ticketing_status}'
        ,pax_id=${pax_id}
        where booking_detail_id=${booking_detail_id}`
    );
};


agentServices.updateSegmentDetails = async (connection,sector_id,origin,destination,arrival,departure,duration,departure_terminal,arrival_terminal,departure_airport_name,
    departure_airport_code,arrival_airport_name,arrival_airport_code,airline_name,flight_number,airline_code,layover_time) => {

    return connection.execute(`
        UPDATE new_flight_segments SET origin='${origin}',destination='${destination}',
        departure='${departure}',arrival='${arrival}',duration='${duration}',arrival_terminal='${arrival_terminal}',
        departure_terminal='${departure_terminal}',departure_airport_name='${departure_airport_name}',arrival_airport_name='${arrival_airport_name}',
        departure_airport_code='${departure_airport_code}',arrival_airport_code='${arrival_airport_code}',airline_name='${airline_name}',
        airline_code='${airline_code}',flight_number='${flight_number}',layover_time='${layover_time}'
        where sector_id=${sector_id}`
    )
}


agentServices.updateSectorDetails = async (connection,departure_terminal,arrival_terminal,departure_airport_name,airline_name,airline_code,base_fare,
                                           total_tax,  published_fare,offered_fare,commission,tds_on_commission,k3_tax,additional_taxes,tdo_markup,agent_markup,service_fee,other_charges,
                                           transaction_fee,gdspnr,total_ssr_amount,departure,flight_number,fare_type,yq_tax,yr_tax,sector_id,origin,
                                           destination,arrival,duration,arrival_airport_name,arrival_airport_code,departure_airport_code) =>{
    return connection.execute(`
    UPDATE new_flight_sectors SET origin='${origin}',destination='${destination}',arrival='${arrival}',
            duration='${duration}',departure_terminal='${departure_terminal}',arrival_terminal='${arrival_terminal}',departure_airport_name='${departure_airport_name}',
            arrival_airport_name='${arrival_airport_name}',arrival_airport_code='${arrival_airport_code}',
            departure_airport_code='${departure_airport_code}',airline_name='${airline_name}',airline_code='${airline_code}',base_fare=${base_fare},
            total_tax=${total_tax},published_fare=${published_fare},offered_fare=${offered_fare},commission=${commission},
            tds_on_commission=${tds_on_commission},yq_tax=${yq_tax},yr_tax=${yr_tax},k3_tax=${k3_tax},additional_taxes=${additional_taxes},
            tdo_markup=${tdo_markup},agent_markup=${agent_markup},service_fee=${service_fee},other_charges=${other_charges},
            transaction_fee=${transaction_fee},gdspnr='${gdspnr}',total_ssr_amount=${total_ssr_amount},
            departure='${departure}',flight_number='${flight_number}',fare_type='${fare_type}' where sector_id=${sector_id}
    `)
}

agentServices.updateSsrDetails = async (connection,price,ssr_id,remarks,ssr_type,description)=>{
    return connection.execute(`
    UPDATE new_flight_ssr SET price=${price},remarks='${remarks}',ssr_type='${ssr_type}',description='${description}' WHERE ssr_id=${ssr_id}
    `)
}

agentServices.CheckPax = async (connection,FirstName,LastName,salutation,booking_id) =>{
    return connection.execute(`SELECT * FROM new_flight_passengers WHERE booking_id=? AND first_name=? AND last_name=? AND salutation=?`,
        [booking_id,FirstName,LastName,salutation])
}

agentServices.AddPax = async (connection,booking_id,salutation,FirstName,LastName,pax_type,gender,ticket_number,date_of_birth,passport_no,passport_expiry,
                              nationality,email_id,agent_phone_no,check_in,cabin,city,country_code,address,markup_per_pax,commission_per_pax,tds_per_pax,base_fare
    ,yq_tax,yr_tax,k3_tax,additional_taxes,published_fare,service_fee,other_charges,
                              transaction_fee,total_ssr_amount,pax_id,stops,total_tax)=>{
    return connection.execute(`
    INSERT INTO new_flight_passengers (
    booking_id,
    salutation,
    first_name,
    last_name,
    gender,
    pax_type,
    ticket_no,
    date_of_birth,
    passport_no,
    passport_expiry,
    nationality,
    booking_status,
    ticketing_status,
    email_id,
    mobile_no,
    check_in_baggage,
    cabin_baggage,
    remarks,
    city,
    country_code,
    address,
    markup_per_pax,
    commission_per_pax,
    tds_per_pax,
    base_fare,
    total_tax,
    stops,
    yq_tax,
    yr_tax,
    k3_tax,
    additional_tax,
    published_fare,
    service_fee,
    other_charges,
    transaction_fee,
    total_ssr_amount,
    pax_id
) VALUES (
    ${booking_id},
    '${salutation}',
    '${FirstName}',
    '${LastName}',
    '${gender}',
    '${pax_type}',
    '${ticket_number}',
    '${date_of_birth}',
    '${passport_no}',
    '${passport_expiry}',
    '${nationality}',
    'Ticketed',
    'Ticketed',
    '${email_id}',
    '${agent_phone_no}',
    '${check_in}',
    '${cabin}',
    'Ticketed Successful',
    '${city}',
    '${country_code}',
    '${address}',
    ${markup_per_pax},
    ${commission_per_pax},
    ${tds_per_pax},
    ${base_fare},
    ${total_tax},
    ${stops},
    ${yq_tax},
    ${yr_tax},
    ${k3_tax},
    ${additional_taxes},
    ${published_fare},
    ${service_fee},
    ${other_charges},
    ${transaction_fee},
    ${total_ssr_amount},
    ${pax_id}
);
`)
}


agentServices.PaxCount = async (connection,booking_id) => {
    return connection.execute(`select total_no_of_pax,total_adult,total_child,total_infant from new_flight_booking where booking_id=${booking_id}`)
}

agentServices.UpdatePaxCount = async (connection,total_no_of_pax,total_adult,total_infant,total_child,booking_id) => {

    return connection.execute(`update new_flight_booking set total_no_of_pax=${total_no_of_pax},total_adult=${total_adult},
                    total_child=${total_child},total_infant=${total_infant} where booking_id=${booking_id}`)
}

agentServices.getAgentDetailsMail=(connection,gmail)=>{
    return connection.execute(`select * from agents where email='${gmail}'`);
}
agentServices.GetAgentEmail=(connection,bookId) => {
    return connection.execute(`select * from new_flight_cancel_queue where booking_id=${bookId}`)
}

agentServices.SectorDetails=(connection,bookId) => {
    return connection.execute(`select * from new_flight_sectors where booking_id=${bookId}`)
}

agentServices.walletData=(connection,walletId) => {
    return connection.execute(`select a.establishment_name,a.id from prepaid_wallet as pw JOIN agents as a ON pw.agent_id=a.id where pw.id = ${walletId}`)
}
module.exports = agentServices;