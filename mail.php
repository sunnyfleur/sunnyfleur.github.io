<?php

$method = $_SERVER['REQUEST_METHOD'];
$recipient_email = 'tranhoangkiet1312@gmail.com';
$project_name = 'Tran Hoang Kiet Portfolio';
$form_subject = 'Portfolio Contact Form Message';
$message = '';
$visitor_email = '';
$c = true;

function adopt($text) {
	return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function sanitize_value($value) {
	return htmlspecialchars(trim((string) $value), ENT_QUOTES, 'UTF-8');
}

$data = $method === 'POST' ? $_POST : $_GET;

if (!empty($data['project_name'])) {
	$project_name = sanitize_value($data['project_name']);
}

if (!empty($data['form_subject'])) {
	$form_subject = sanitize_value($data['form_subject']);
}

foreach ($data as $key => $value) {
	if ($value === '' || $key === 'project_name' || $key === 'admin_email' || $key === 'form_subject') {
		continue;
	}

	if ($key === 'E-mail') {
		$sanitized_email = filter_var(trim((string) $value), FILTER_VALIDATE_EMAIL);
		if ($sanitized_email) {
			$visitor_email = $sanitized_email;
		}
	}

	$safe_key = sanitize_value($key);
	$safe_value = nl2br(sanitize_value($value));
	$row_style = ($c = !$c) ? '<tr>' : '<tr style="background-color: #f8f8f8;">';

	$message .= "
		{$row_style}
			<td style='padding: 10px; border: #e9e9e9 1px solid;'><b>{$safe_key}</b></td>
			<td style='padding: 10px; border: #e9e9e9 1px solid;'>{$safe_value}</td>
		</tr>
	";
}

$message = "<table style='width: 100%;'>{$message}</table>";
$reply_to = $visitor_email ?: $recipient_email;

$headers = "MIME-Version: 1.0" . PHP_EOL .
	"Content-Type: text/html; charset=utf-8" . PHP_EOL .
	'From: ' . adopt($project_name) . ' <' . $recipient_email . '>' . PHP_EOL .
	'Reply-To: ' . $reply_to . PHP_EOL;

mail($recipient_email, adopt($form_subject), $message, $headers);
