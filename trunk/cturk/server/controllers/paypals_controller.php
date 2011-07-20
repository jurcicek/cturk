<?php
class PaypalsController extends AppController {
	
	var $name = 'User';
	
	var $autoRender = false;
	
	var $components = array ('Paypal' );
	
	public function index() {
		$this->redirect ( "pay" );
	}
	
	/**
	 * payment page
	 */
	public function pay() {
		header ( "Content-Type: text/html; charset=utf-8" );
		$html = '';
		$html .= '
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" >
		<head>
		<title>Pay</title>
		</head>
		<body style="background-color:#ccc;">
		';
		$html .= '
		<form id="form1" name="form1" method="post" action="payReceipt">
			<center>
				<table class="api" align="center">
					<tr>
						<td class="header" style="width:408px" align="center"> <b>Adaptive Payments - Pay</b></td>
					</tr>
					<tr>
						<td align="center">
							You must be logged into <a href="https://developer.paypal.com" target="_blank" name="PayPalDeveloperCentralLink">Developer Central</a>
						</td>
					</tr>
				</table>
				<table>
					<tr>
						<td colspan="4" style="height:60px; background:#41627e; text-align:center;"><b>Sender Details</b></td>
					</tr>
					<tr>
						<td>Sender\'s Email:</td>
						<td><input type="text" name="email" value="" /></td>
					</tr>
					<tr>
						<td>currencyCode</td>
						<td>
							<select name="currencyCode">
								<option value="USD">USD</option>
								<option value="GBP">GBP</option>
								<option value="EUR">EUR</option>
								<option value="JPY">JPY</option>
								<option value="CAD">CAD</option>
								<option value="AUD">AUD</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Fees Payer</td>
						<td>
							<select name="feesPayer" id="currencyCode">
								<option value="EACHRECEIVER">EACHRECEIVER</option>
								<option value="PRIMARYRECEIVER">PRIMARYRECEIVER</option>
								<option value="SENDER">SENDER</option>
								<option value="SECONDARYONLY">SECONDARYONLY</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Action Type</td>
						<td>
							<select name="actionType">
								<option value="PAY" selected="true">PAY</option>
								<option value="CREATE">CREATE</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Preapproval Key:</td>
						<td>
							<input type="text" name="preapprovalkey" value="" />
						</td>
					</tr>
					<tr>
						<td colspan="4" style="height:60px; background:#41627e; text-align:center;"><b>Receiver Details</b><td>
					</tr>
					<tr>
						<td>Payee</td>
						<td>ReceiverEmail (Required):</td>
						<td>Amount(Required):</td>
						<td>Primary Receiver(Required):</td>
					</tr>
					<tr>
						<td>Receiver Email 1</td>
						<td><input type="text" name="receiveremail[0]" value="" /></td>
						<td><input type="text" name="amount[0]" value="" /></td>
						<td><select name="primaryReceiver[0]">
							<option value="true">true</option>
							<option value="false" selected="true">false</option>
						</select></td>
					</tr>
					<tr>
						<td>Receiver Email 2</td>
						<td><input type="text" name="receiveremail[1]" value="" /></td>
						<td><input type="text" name="amount[1]" value="" /></td>
						<td><select name="primaryReceiver[1]">
							<option value="true">true</option>
							<option value="false" selected="true">false</option>
						</select></td>
					</tr>
					<tr>
						<td>Memo:</td>
						<td>
							<textarea rows="2" cols="30" name="memo">This is the memo</textarea>
						</td>
					</tr>
					<tr>
						<td>&nbsp;</td>
						<td><input type="submit" value="Submit" /></td>
					</tr>
				</table>
			</center>
		</form>';
		$html .= '</body></html>';
		echo $html;
	}
	
	/**
	 * This file is called after the user clicks on a button during
	 * the Pay process to use PayPal's AdaptivePayments Pay features'. The
	 * user logs in to their PayPal account.
	 */
	public function payReceipt() {
		//session_start();
		$this->setPaypalParameter ();
		
		try {
			$serverName = $_SERVER ['SERVER_NAME'];
			$serverPort = $_SERVER ['SERVER_PORT'];
			$url = dirname ( 'http://' . $serverName . ':' . $serverPort . $_SERVER ['REQUEST_URI'] );
			$returnURL = $url . "/paymentDetails";
			$cancelURL = $url . "/pay";
			$preapprovalKey = $_POST ["preapprovalkey"];
			$request_array = array (//
"actionType" => $_POST ['actionType'], //
"cancelUrl" => $cancelURL, //
"returnUrl" => $returnURL, //
"currencyCode" => $_POST ['currencyCode'], //
//"receiverList.receiver[0].amount" => $_POST ['amount'] [0], //
			//"receiverList.receiver[0].email" => $_POST ['receiveremail'] [0], //
			//"receiverList.receiver[0].primary[0]" => $_POST ['primaryReceiver'] [0], //
			"senderEmail" => $_POST ["email"], //
"clientDetails.deviceId" => $this->Paypal->DEVICE_ID, //
"clientDetails.ipAddress" => '127.0.0.1', //
"clientDetails.applicationId" => $this->Paypal->APPLICATION_ID, //
"requestEnvelope.errorLanguage" => 'en_US', //
"memo" => $_POST ["memo"], //
"feesPayer" => $_POST ["feesPayer"] ); //
			foreach ( $_POST ['receiveremail'] as $i => $receiveremail ) {
				if (! empty ( $receiveremail )) {
					$amount = $_POST ['amount'] [$i];
					$primary = $_POST ['primaryReceiver'] [$i];
					$request_array ["receiverList.receiver[$i].amount"] = $amount;
					$request_array ["receiverList.receiver[$i].email"] = $receiveremail;
					$request_array ["receiverList.receiver[$i].primary[$i]"] = $primary;
				}
			}
			if ($preapprovalKey != "") {
				$request_array ["preapprovalKey"] = $preapprovalKey;
			}
			$nvpStr = http_build_query ( $request_array );
			
			/**
			 * Make the call to PayPal to get the Pay token
			 * If the API call succeded, then redirect the buyer to PayPal
			 * to begin to authorize payment.  If an error occured, show the
			 * resulting errors
			 */
			$resArray = $this->Paypal->hashCall ( 'AdaptivePayments/Pay', $nvpStr );
			
			/**
			 * Display the API response back to the browser.
			 * If the response from PayPal was a success, display the response parameters'
			 * If the response was an error, display the errors received using APIError.php.
			 */
			$ack = strtoupper ( $resArray ['responseEnvelope.ack'] );
			if ($ack != "SUCCESS") {
				$_SESSION ['reshash'] = $resArray;
				//$location = "APIError.php";
				//header ( "Location: $location" );
				$this->Paypal->showAPIError ();
			
			} else {
				$_SESSION ['payKey'] = $resArray ['payKey'];
				$payKey = $resArray ['payKey'];
				if (($resArray ['paymentExecStatus'] == "COMPLETED")) {
					$case = "1";
				
				} else if (($_POST ['actionType'] == "PAY") && ($resArray ['paymentExecStatus'] == "CREATED")) {
					$case = "2";
				
				} else if (($preapprovalKey != null) && ($_POST ['actionType'] == "CREATE") && ($resArray ['paymentExecStatus'] == "CREATED")) {
					$case = "3";
				
				} else if (($_POST ['actionType'] == "CREATE") && ($resArray ['paymentExecStatus'] == "CREATED")) {
					$temp1 = $this->Paypal->API_USERNAME;
					$temp2 = str_replace ( '_api1.', '@', $temp1 );
					if ($temp2 == $_POST ["email"]) {
						$case = "3";
					} else {
						$case = "2";
					}
				}
			}
		
		} catch ( Exception $ex ) {
			throw new Exception ( 'Error occurred in PayReceipt method' );
		}
		
		$html = '';
		$html .= '
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html>
		<head>
		<title>Payment Details</title>
		</head>
		<body style="background-color:#ccc; text-align:center;">
		<table style="text-align:left; margin:0 auto;">
			<tr>
				<td colspan="2"><b>Pay - Response</b></td>
			</tr>
		';
		foreach ( $resArray as $key => $value ) {
			$html .= "<tr><td> $key:</td><td>$value</td></tr>";
		}
		$html .= '</table>';
		switch ($case) {
			case "1" :
				$payReturnURL = $this->PAY_RETURN_LINK;
				$html .= " <a href=\"$payReturnURL\"><b>* Click HERE to RETURN Website </b></a>";
				break;
			case "2" :
				$token = $resArray ['payKey'];
				$payPalURL = $this->Paypal->PAYPAL_REDIRECT_URL . '_ap-payment&paykey=' . $token;
				$html .= " <a href=\"$payPalURL\"><b>* Redirect URL to Complete Payment </b></a><br />";
				break;
			case "3" :
				$token = $resArray ['payKey'];
				$payPalURL = $this->Paypal->PAYPAL_REDIRECT_URL . '_ap-payment&paykey=' . $token;
				$html .= " <a href=\"$payPalURL\"><b>* Redirect URL to Complete Payment </b></a><br />";
				//echo "<a href=SetPaymentOption.php?payKey=$payKey><b>* Set Payment Options(optional)</b></a><br />";
				//echo "<a href=ExecutePaymentOption.php?payKey=$payKey><b>* Execute Payment Options</b></a><br />";
				break;
		}
		$html .= '</body></html>';
		echo $html;
	}
	
	/**
	 * This page is specified as the ReturnURL for the Pay Operation.
	 * When returned from PayPal this page is called.
	 * Page get the payment details for the payKey either stored
	 * in the session or passed in the Request.
	 */
	public function paymentDetails() {
		//session_start();
		$this->setPaypalParameter ();
		if (isset ( $_GET ['cs'] )) {
			$_SESSION ['payKey'] = '';
		}
		try {
			if (isset ( $_POST ["payKey"] )) {
				$payKey = $_POST ["payKey"];
			}
			if (empty ( $payKey )) {
				$payKey = $_SESSION ['payKey'];
			}
			
			$request_array = array (//
"payKey" => $payKey, //
"requestEnvelope.errorLanguage" => 'en_US' );
			
			$nvpStr = http_build_query ( $request_array );
			$resArray = $this->Paypal->hashCall ( "AdaptivePayments/PaymentDetails", $nvpStr );
			
			/* Display the API response back to the browser.
			   If the response from PayPal was a success, display the response parameters'
			   If the response was an error, display the errors received using APIError.php.
			 */
			$ack = strtoupper ( $resArray ["responseEnvelope.ack"] );
			if ($ack != "SUCCESS") {
				$_SESSION ['reshash'] = $resArray;
				//$location = "APIError.php";
				//header ( "Location: $location" );
				$this->Paypal->showAPIError ();
			}
		
		} catch ( Exception $ex ) {
			throw new Exception ( 'Error occurred in PaymentDetails method' );
		}
		
		header ( "Content-Type: text/html; charset=utf-8" );
		$html = '';
		$html .= '
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" >
		<head>
		<title>Payment Details</title>
		</head>
		<body style="background-color:#ccc;">
		<table style="text-align:left; margin:0 auto;">
			<tr>
				<td colspan="2"><b>Pay - Response</b></td>
			</tr>
		';
		foreach ( $resArray as $key => $value ) {
			$html .= "<tr><td> $key:</td><td>$value</td></tr>";
		}
		$payReturnURL = $this->PAY_RETURN_LINK;
		$html .= '<tr><td>';
		$html .= " <a href=\"$payReturnURL\"><b>* Click HERE to RETURN Website </b></a>";
		$html .= '</td></tr>';
		$html .= '</table>';
		$html .= '</body></html>';
		echo $html;
	}
	
	private function setPaypalParameter() {
		$this->Paypal->APPLICATION_ID = $this->PAYPAL_APPLICATION_ID;
		$this->Paypal->API_USERNAME = $this->PAYPAL_API_USERNAME;
		$this->Paypal->API_PASSWORD = $this->PAYPAL_API_PASSWORD;
		$this->Paypal->API_SIGNATURE = $this->PAYPAL_API_SIGNATURE;
		$this->Paypal->API_ENDPOINT = $this->PAYPAL_API_ENDPOINT;
		$this->Paypal->PAYPAL_REDIRECT_URL = $this->PAYPAL_REDIRECT_URL;
	}
}
?>